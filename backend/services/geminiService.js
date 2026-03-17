const { GoogleGenerativeAI } = require('@google/generative-ai');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Service = require('../models/Service');
const Doctor = require('../models/Doctor');
const usageTracker = require('../utils/geminiUsageTracker');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Clinic information
const CLINIC_INFO = {
  name: 'Dr. Hanif Niazi Dental Care',
  location: 'Clinic No 1 PAF Road, Mianwali',
  phone: '+92 320 2067666',
  emergencyPhone: '+92 300 6089947',
  email: 'info@hanifniazidental.com',
  hours: {
    weekdays: 'Monday-Friday: 9:00 AM - 6:00 PM',
    saturday: 'Saturday: 9:00 AM - 2:00 PM',
    sunday: 'Sunday: Closed'
  }
};

// Services with pricing
const SERVICES_INFO = {
  cleaning: { name: 'Teeth Cleaning', price: 'Rs. 2,000 - 4,000', duration: '45-60 minutes' },
  whitening: { name: 'Teeth Whitening', price: 'Rs. 8,000 - 15,000', duration: '1-2 hours' },
  filling: { name: 'Dental Fillings', price: 'Rs. 3,000 - 8,000 per tooth', duration: '30-60 minutes' },
  rootCanal: { name: 'Root Canal Treatment', price: 'Rs. 8,000 - 20,000', duration: '1-2 hours' },
  extraction: { name: 'Tooth Extraction', price: 'Rs. 2,500 - 8,000', duration: '15-60 minutes' },
  crown: { name: 'Dental Crowns', price: 'Rs. 12,000 - 25,000', duration: '2 visits' },
  implant: { name: 'Dental Implants', price: 'Rs. 60,000 - 120,000', duration: '3-6 months' },
  braces: { name: 'Braces / Orthodontics', price: 'Rs. 80,000 - 300,000', duration: '12-24 months' },
  veneer: { name: 'Dental Veneers', price: 'Rs. 15,000 - 35,000 per tooth', duration: '2-3 visits' },
  wisdom: { name: 'Wisdom Tooth Removal', price: 'Rs. 5,000 - 15,000 per tooth', duration: '30-90 minutes' },
  dentures: { name: 'Dentures', price: 'Rs. 15,000 - 80,000', duration: 'Multiple visits' },
  checkup: { name: 'General Checkup', price: 'Rs. 1,000 - 2,000', duration: '30 minutes' }
};

// Build system prompt based on user context
function buildSystemPrompt(userContext, userData = null) {
  let userInfo = '';

  if (userContext === 'logged_in' && userData) {
    userInfo = `
USER STATUS: Logged in patient
- Name: ${userData.name}
- Email: ${userData.email}
- Phone: ${userData.phone}
When booking, use this information automatically. No need to ask for contact details.`;
  } else if (userContext === 'registered_not_logged_in') {
    userInfo = `
USER STATUS: Has an account but not logged in
Gently suggest: "I notice you might have an account with us. Would you like to log in for a faster booking experience?"`;
  } else if (userContext === 'returning_guest') {
    userInfo = `
USER STATUS: Returning guest (has chatted before)
Be welcoming: "Welcome back! How can I help you today?"`;
  } else {
    userInfo = `
USER STATUS: New guest
Be friendly and welcoming. Collect contact information during booking.`;
  }

  return `You are Sara, a friendly and professional AI dental assistant for ${CLINIC_INFO.name}.

CLINIC INFORMATION:
- Location: ${CLINIC_INFO.location}
- Phone: ${CLINIC_INFO.phone}
- Emergency: ${CLINIC_INFO.emergencyPhone}
- Email: ${CLINIC_INFO.email}
- Hours: ${CLINIC_INFO.hours.weekdays}, ${CLINIC_INFO.hours.saturday}, ${CLINIC_INFO.hours.sunday}

${userInfo}

YOUR CAPABILITIES:
1. Book appointments - Check availability and schedule appointments
2. Provide service information with pricing
3. Answer questions about dental procedures
4. Handle emergency guidance (always recommend calling emergency line)
5. Provide clinic information (hours, location, contact)

BOOKING FLOW:
1. Ask what type of appointment they need
2. Use get_available_doctors function to show doctors who provide that service
3. Let patient choose their preferred doctor (or suggest based on availability/rating)
4. Use check_availability function to show available dates/times
5. For logged-in users: Confirm using their profile info
6. For guests: Collect name, phone, and optionally email
7. Use book_appointment function with doctorId to finalize
8. Always confirm all details including doctor name before booking

RESPONSE STYLE:
- Be warm, friendly, and professional
- Keep responses concise but helpful
- Use simple formatting (no complex markdown)
- For emergencies, ALWAYS prioritize the emergency phone number
- Use maximum 1-2 emojis sparingly for warmth
- Be culturally appropriate for Pakistani audience

IMPORTANT RULES:
- Never make up information about services or prices
- Always use the provided functions for real-time data
- If unsure, offer to connect with staff
- For medical emergencies, immediately provide emergency number
- Confirm all booking details before finalizing`;
}

// Function definitions for Gemini
const functionDeclarations = [
  {
    name: 'get_available_doctors',
    description: 'Get list of doctors available for a specific service. Use this after the user specifies what type of appointment/service they need.',
    parameters: {
      type: 'object',
      properties: {
        serviceType: {
          type: 'string',
          description: 'Type of dental service or appointment needed (e.g., "Teeth Cleaning", "Root Canal", "Dental Checkup")'
        }
      },
      required: ['serviceType']
    }
  },
  {
    name: 'check_availability',
    description: 'Check available appointment time slots for a specific doctor on a specific date. Use this after user has selected a doctor.',
    parameters: {
      type: 'object',
      properties: {
        doctorId: {
          type: 'string',
          description: 'ID of the selected doctor'
        },
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format'
        }
      },
      required: ['doctorId', 'date']
    }
  },
  {
    name: 'book_appointment',
    description: 'Book an appointment after user has confirmed all details including doctor selection. Only use after user explicitly confirms.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Patient name' },
        phone: { type: 'string', description: 'Patient phone number' },
        email: { type: 'string', description: 'Patient email (optional)' },
        date: { type: 'string', description: 'Appointment date in YYYY-MM-DD format' },
        time: { type: 'string', description: 'Appointment time in HH:MM format (24-hour)' },
        serviceType: { type: 'string', description: 'Type of dental service' },
        doctorId: { type: 'string', description: 'ID of the selected doctor' }
      },
      required: ['name', 'phone', 'date', 'time', 'serviceType', 'doctorId']
    }
  },
  {
    name: 'get_services',
    description: 'Get list of dental services with pricing. Use when user asks about services, treatments, or prices.',
    parameters: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['all', 'preventive', 'cosmetic', 'surgical', 'orthodontic'],
          description: 'Category of services to retrieve'
        }
      }
    }
  },
  {
    name: 'detect_user_account',
    description: 'Check if email or phone has an existing account. Use when guest provides contact info during booking.',
    parameters: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Email to check' },
        phone: { type: 'string', description: 'Phone number to check' }
      }
    }
  }
];

// Execute function calls
async function executeFunctionCall(name, params) {
  switch (name) {
    case 'get_available_doctors':
      return await getAvailableDoctors(params.serviceType);
    case 'check_availability':
      return await checkAvailability(params.doctorId, params.date);
    case 'book_appointment':
      return await bookAppointment(params);
    case 'get_services':
      return getServices(params.category);
    case 'detect_user_account':
      return await detectUserAccount(params);
    default:
      return { error: 'Unknown function' };
  }
}

// Get available doctors for a specific service
async function getAvailableDoctors(serviceType) {
  try {
    // Find service by name (case-insensitive partial match)
    const service = await Service.findOne({
      name: { $regex: new RegExp(serviceType, 'i') }
    });

    if (!service) {
      return {
        success: false,
        message: `Service "${serviceType}" not found. Would you like to see all our services?`,
        doctors: []
      };
    }

    // Find active doctors who provide this service
    const doctors = await Doctor.find({
      services: service._id,
      isActive: true
    }).select('name specialization experience rating bio workingDays');

    if (doctors.length === 0) {
      return {
        success: false,
        message: `No doctors currently available for ${service.name}. Please contact us directly.`,
        doctors: []
      };
    }

    // Format doctor information for the AI
    const doctorInfo = doctors.map(doc => {
      const workingDays = Object.entries(doc.workingDays)
        .filter(([day, schedule]) => schedule.isWorking)
        .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1, 3))
        .join(', ');

      return {
        id: doc._id.toString(),
        name: doc.name,
        specialization: doc.specialization,
        experience: `${doc.experience} years`,
        rating: doc.rating,
        bio: doc.bio,
        availability: workingDays || 'Contact for schedule'
      };
    });

    return {
      success: true,
      service: service.name,
      doctors: doctorInfo,
      message: `Found ${doctors.length} doctor(s) available for ${service.name}`
    };
  } catch (error) {
    console.error('Get available doctors error:', error);
    return { success: false, error: 'Failed to fetch available doctors', doctors: [] };
  }
}

// Check available slots for a specific doctor on a date
async function checkAvailability(doctorId, dateStr) {
  try {
    // Find the doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.isActive) {
      return {
        success: false,
        message: 'Selected doctor is not available. Please choose another doctor.'
      };
    }

    const selectedDate = new Date(dateStr);
    const dayOfWeekNum = selectedDate.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[dayOfWeekNum];

    // Past date check
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return {
        success: false,
        message: 'Cannot book appointments in the past. Please select a future date.'
      };
    }

    // Check if doctor works on this day
    const daySchedule = doctor.workingDays[dayOfWeek];
    if (!daySchedule || !daySchedule.isWorking) {
      return {
        success: false,
        closed: true,
        message: `Dr. ${doctor.name} does not work on ${dayOfWeek}s. Please select another day or doctor.`
      };
    }

    // Generate slots based on doctor's schedule
    const allSlots = [];
    const [startHours, startMinutes] = daySchedule.start.split(':').map(Number);
    const [endHours, endMinutes] = daySchedule.end.split(':').map(Number);
    const startTime = startHours * 60 + startMinutes;
    const endTime = endHours * 60 + endMinutes;

    let breakStart = null;
    let breakEnd = null;
    if (daySchedule.breakStart && daySchedule.breakEnd) {
      const [bsHours, bsMinutes] = daySchedule.breakStart.split(':').map(Number);
      const [beHours, beMinutes] = daySchedule.breakEnd.split(':').map(Number);
      breakStart = bsHours * 60 + bsMinutes;
      breakEnd = beHours * 60 + beMinutes;
    }

    // Generate 30-minute slots
    for (let time = startTime; time < endTime; time += 30) {
      // Skip break time
      if (breakStart && breakEnd && time >= breakStart && time < breakEnd) {
        continue;
      }

      const hours = Math.floor(time / 60);
      const minutes = time % 60;
      const timeSlot = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      allSlots.push(timeSlot);
    }

    // Find booked slots for this doctor
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: new Date(`${dateStr}T00:00:00`), $lt: new Date(`${dateStr}T23:59:59`) },
      status: { $ne: 'cancelled' }
    });

    const bookedSlots = bookedAppointments.map(apt => apt.time);
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    // Format for display
    const formattedDate = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });

    const formatTime = (t) => {
      const [h, m] = t.split(':');
      const hour = parseInt(h);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${h12}:${m} ${ampm}`;
    };

    return {
      success: true,
      doctorName: doctor.name,
      date: dateStr,
      formattedDate,
      availableSlots: availableSlots.slice(0, 10).map(s => ({
        time: s,
        display: formatTime(s)
      })),
      totalAvailable: availableSlots.length,
      message: availableSlots.length > 0
        ? `Dr. ${doctor.name} has ${availableSlots.length} available slots for ${formattedDate}`
        : `Dr. ${doctor.name} has no available slots for ${formattedDate}. Please try another date or doctor.`
    };
  } catch (error) {
    console.error('Check availability error:', error);
    return { success: false, error: 'Failed to check availability' };
  }
}

// Book an appointment
async function bookAppointment(params) {
  try {
    const { name, phone, email, date, time, serviceType, doctorId } = params;

    // Validate doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.isActive) {
      return { success: false, message: 'Selected doctor is not available. Please choose another doctor.' };
    }

    const selectedDate = new Date(date);

    // Check slot availability for this specific doctor
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: { $gte: new Date(`${date}T00:00:00`), $lt: new Date(`${date}T23:59:59`) },
      time: time,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return {
        success: false,
        message: `Dr. ${doctor.name} already has an appointment at this time. Please select another time slot.`
      };
    }

    // Check for existing user
    let patient = null;
    if (email) {
      patient = await User.findOne({ email: email.toLowerCase() });
    }
    if (!patient && phone) {
      patient = await User.findOne({ phone: phone });
    }

    // Create appointment
    const newAppointment = new Appointment({
      patient: patient ? patient._id : null,
      guestInfo: {
        name: name,
        phone: phone,
        email: email || null
      },
      serviceType: serviceType || 'General Consultation',
      doctor: doctorId,
      date: selectedDate,
      time: time,
      status: 'pending',
      source: 'chatbot-ai',
      notes: `Booked via AI chatbot. Service: ${serviceType}. Doctor: ${doctor.name}`
    });

    await newAppointment.save();

    // Format for response
    const formattedDate = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const formattedTime = `${h12}:${m} ${ampm}`;

    return {
      success: true,
      appointmentId: newAppointment._id,
      message: 'Appointment booked successfully!',
      details: {
        name,
        phone,
        email: email || 'Not provided',
        service: serviceType,
        doctor: `Dr. ${doctor.name} (${doctor.specialization})`,
        date: formattedDate,
        time: formattedTime
      }
    };
  } catch (error) {
    console.error('Book appointment error:', error);
    return { success: false, message: 'Failed to book appointment. Please try again.' };
  }
}

// Get services list
function getServices(category = 'all') {
  let services = [];

  const categorized = {
    preventive: ['cleaning', 'checkup'],
    cosmetic: ['whitening', 'veneer'],
    surgical: ['extraction', 'wisdom', 'implant'],
    orthodontic: ['braces'],
    restorative: ['filling', 'rootCanal', 'crown', 'dentures']
  };

  if (category === 'all') {
    services = Object.entries(SERVICES_INFO).map(([key, value]) => ({
      id: key,
      ...value
    }));
  } else {
    const serviceKeys = categorized[category] || [];
    services = serviceKeys.map(key => ({
      id: key,
      ...SERVICES_INFO[key]
    })).filter(s => s.name);
  }

  return {
    success: true,
    category,
    services,
    message: `Found ${services.length} services`
  };
}

// Check if user has an account
async function detectUserAccount(params) {
  try {
    const { email, phone } = params;
    let user = null;

    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    }
    if (!user && phone) {
      user = await User.findOne({ phone: phone });
    }

    if (user) {
      return {
        found: true,
        message: 'Existing account found. User may want to log in for faster booking.'
      };
    }

    return {
      found: false,
      message: 'No existing account found. Will create guest booking.'
    };
  } catch (error) {
    return { found: false, error: 'Failed to check account' };
  }
}

// Main function to send message to Gemini
async function sendMessage(messages, userContext, userData = null) {
  try {
    // Check rate limits
    if (!usageTracker.canMakeRequest()) {
      const stats = usageTracker.getStats();
      console.warn('⚠️ Gemini API rate limit reached:', stats);
      return {
        success: false,
        content: getFallbackResponse(messages[messages.length - 1]?.content || ''),
        error: 'Rate limit exceeded. Please try again in a moment.',
        functionCalls: [],
        latency: 0,
        tokens: { input: 0, output: 0 }
      };
    }

    // Record request
    usageTracker.recordRequest();

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      tools: [{ functionDeclarations }]
    });

    const systemPrompt = buildSystemPrompt(userContext, userData);

    // Build chat history
    const chatHistory = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: chatHistory,
      systemInstruction: { parts: [{ text: systemPrompt }] }
    });

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    const startTime = Date.now();

    // Send message
    let result = await chat.sendMessage(lastMessage.content);
    let response = result.response;
    let functionCalls = [];

    // Handle function calls
    let calls = response.functionCalls ? response.functionCalls() : [];
    while (calls && calls.length > 0) {
      for (const call of calls) {
        console.log(`Executing function: ${call.name}`, call.args);
        const functionResult = await executeFunctionCall(call.name, call.args);

        functionCalls.push({
          name: call.name,
          params: call.args,
          result: functionResult
        });

        // Send function result back to model
        result = await chat.sendMessage([{
          functionResponse: {
            name: call.name,
            response: functionResult
          }
        }]);
        response = result.response;
      }
      // Update calls for the next iteration
      calls = response.functionCalls ? response.functionCalls() : [];
    }

    const latency = Date.now() - startTime;
    const text = response.text();

    return {
      success: true,
      content: text,
      functionCalls,
      latency,
      tokens: {
        input: response.usageMetadata?.promptTokenCount || 0,
        output: response.usageMetadata?.candidatesTokenCount || 0
      }
    };
  } catch (error) {
    console.error('Gemini API error:', error);

    // Fallback response
    return {
      success: false,
      content: getFallbackResponse(messages[messages.length - 1]?.content || ''),
      error: error.message,
      functionCalls: [],
      latency: 0,
      tokens: { input: 0, output: 0 }
    };
  }
}

// Fallback response when AI fails
function getFallbackResponse(input) {
  const text = input.toLowerCase();

  if (text.includes('emergency') || text.includes('urgent') || text.includes('pain')) {
    return `For emergencies, please call our emergency line immediately: ${CLINIC_INFO.emergencyPhone}\n\nOur team is available 24/7 for dental emergencies.`;
  }

  if (text.includes('book') || text.includes('appointment')) {
    return `I'd love to help you book an appointment! Please visit our online booking page or call us at ${CLINIC_INFO.phone}.\n\nOur hours are:\n${CLINIC_INFO.hours.weekdays}\n${CLINIC_INFO.hours.saturday}`;
  }

  if (text.includes('service') || text.includes('price') || text.includes('cost')) {
    return `We offer a wide range of dental services including cleanings, whitening, fillings, crowns, implants, and more.\n\nFor detailed pricing, please call us at ${CLINIC_INFO.phone} or visit our services page.`;
  }

  if (text.includes('hour') || text.includes('time') || text.includes('open')) {
    return `Our clinic hours are:\n${CLINIC_INFO.hours.weekdays}\n${CLINIC_INFO.hours.saturday}\n${CLINIC_INFO.hours.sunday}\n\nCall us: ${CLINIC_INFO.phone}`;
  }

  return `I apologize, but I'm having trouble processing your request right now.\n\nYou can reach us directly at:\n📞 Phone: ${CLINIC_INFO.phone}\n🚨 Emergency: ${CLINIC_INFO.emergencyPhone}\n📧 Email: ${CLINIC_INFO.email}\n\nHow else can I help you?`;
}

module.exports = {
  sendMessage,
  executeFunctionCall,
  checkAvailability,
  bookAppointment,
  getServices,
  detectUserAccount,
  buildSystemPrompt,
  CLINIC_INFO,
  SERVICES_INFO
};
