// ============================================
// DR. AHMED DENTAL CARE - CUSTOMER SUPPORT AGENT
// ============================================

export const chatbotConfig = {
  clinicName: 'Dr. Ahmed Dental Care',
  botName: 'Sara',
  phone: '+92 320 2067666',
  emergencyPhone: '+92 300 6089947',
  email: 'info@ahmeddental.com',
  address: '123 Main Street, Gulshan-e-Iqbal, Karachi',

  officeHours: {
    monday: '9:00 AM - 6:00 PM',
    tuesday: '9:00 AM - 6:00 PM',
    wednesday: '9:00 AM - 6:00 PM',
    thursday: '9:00 AM - 6:00 PM',
    friday: '9:00 AM - 6:00 PM',
    saturday: '9:00 AM - 2:00 PM',
    sunday: 'Closed'
  },

  quickActions: [
    { id: 'appointment', label: 'Book Appointment', icon: 'calendar' },
    { id: 'services', label: 'Our Services', icon: 'sparkles' },
    { id: 'emergency', label: 'Emergency', icon: 'alert' },
    { id: 'hours', label: 'Clinic Hours', icon: 'clock' },
    { id: 'contact', label: 'Contact Us', icon: 'phone' }
  ]
}

// ============================================
// SMART KEYWORD MATCHING
// ============================================

export const keywords = {
  // Greetings
  greeting: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'salam', 'aoa', 'assalam', 'hlo', 'hii', 'helloo', 'howdy', 'sup', 'yo'],

  // Appointment related
  appointment: ['appointment', 'book', 'booking', 'schedule', 'slot', 'visit', 'come in', 'see doctor', 'see dentist', 'available', 'availability', 'reserve', 'appoint', 'appoinment', 'appointmnt', 'meet doctor', 'checkup', 'check up', 'check-up'],

  // Emergency
  emergency: ['emergency', 'urgent', 'immediately', 'asap', 'right now', 'bleeding', 'blood', 'severe pain', 'extreme pain', 'unbearable', 'cant sleep', 'accident', 'knocked out', 'broken tooth', 'cracked', 'swollen', 'swelling', 'infection', 'pus', 'fever', 'abscess'],

  // Pain related
  pain: ['pain', 'hurt', 'hurts', 'hurting', 'ache', 'aching', 'sore', 'sensitive', 'toothache', 'tooth ache', 'painful', 'throbbing', 'sharp pain', 'dull pain'],

  // Services
  services: ['services', 'treatments', 'procedures', 'what do you do', 'what do you offer', 'treatments available', 'list of services', 'dental services'],

  // Specific services
  cleaning: ['cleaning', 'clean', 'polish', 'scaling', 'hygiene', 'plaque', 'tartar', 'deep clean'],
  whitening: ['whitening', 'whiten', 'bleach', 'white teeth', 'yellow teeth', 'stains', 'stained', 'discolored', 'brighter'],
  filling: ['filling', 'cavity', 'cavities', 'hole', 'decay', 'decayed', 'black spot'],
  rootCanal: ['root canal', 'rct', 'nerve', 'infected tooth', 'root treatment', 'pulp'],
  extraction: ['extraction', 'extract', 'pull', 'remove tooth', 'take out tooth', 'tooth removal'],
  crown: ['crown', 'cap', 'dental crown', 'tooth cap', 'cover tooth'],
  implant: ['implant', 'implants', 'missing tooth', 'replace tooth', 'artificial tooth', 'titanium'],
  braces: ['braces', 'orthodontic', 'straighten', 'crooked', 'alignment', 'invisalign', 'aligner'],
  dentures: ['denture', 'dentures', 'false teeth', 'artificial teeth'],
  veneer: ['veneer', 'veneers', 'smile makeover', 'front teeth', 'cosmetic'],
  wisdom: ['wisdom', 'wisdom tooth', 'wisdom teeth', 'third molar'],

  // Timing related
  hours: ['hours', 'timing', 'timings', 'open', 'close', 'when open', 'working hours', 'office hours', 'time', 'schedule'],
  today: ['today', 'now', 'right now', 'this moment'],
  tomorrow: ['tomorrow', 'next day', 'kal'],
  weekend: ['saturday', 'sunday', 'weekend'],

  // Location & Contact
  location: ['location', 'address', 'where', 'directions', 'how to reach', 'map', 'located', 'find you'],
  contact: ['contact', 'phone', 'number', 'call', 'email', 'reach', 'talk to', 'speak to'],

  // Cost related
  cost: ['cost', 'price', 'pricing', 'fee', 'charges', 'how much', 'rate', 'expensive', 'cheap', 'affordable', 'payment', 'pay'],

  // Fear/Anxiety
  anxiety: ['scared', 'afraid', 'nervous', 'anxiety', 'anxious', 'fear', 'worried', 'phobia', 'hate dentist', 'dont like'],

  // Thanks
  thanks: ['thank', 'thanks', 'thx', 'appreciate', 'grateful', 'helpful', 'great help'],

  // Goodbye
  bye: ['bye', 'goodbye', 'see you', 'take care', 'later', 'good night', 'gn'],

  // Negative/Confusion
  no: ['no', 'nope', 'nah', 'not', 'dont', 'cancel', 'stop', 'nevermind'],
  yes: ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'correct', 'right', 'confirm', 'proceed'],

  // Human handoff
  human: ['human', 'person', 'real person', 'agent', 'representative', 'staff', 'receptionist', 'speak to someone', 'talk to someone', 'not helping', 'useless']
}

// ============================================
// SERVICES DATABASE
// ============================================

export const servicesInfo = {
  cleaning: {
    name: 'Teeth Cleaning',
    description: 'Professional cleaning to remove plaque and tartar for healthy teeth and gums.',
    price: 'Rs. 2,000 - 4,000',
    duration: '45-60 minutes',
    details: 'Includes scaling, polishing, and oral examination.'
  },
  whitening: {
    name: 'Teeth Whitening',
    description: 'Professional whitening treatment to brighten your smile by 3-8 shades.',
    price: 'Rs. 8,000 - 15,000',
    duration: '1-2 hours',
    details: 'Safe and effective in-office treatment with instant results.'
  },
  filling: {
    name: 'Dental Fillings',
    description: 'Repair cavities and restore tooth function with tooth-colored or silver fillings.',
    price: 'Rs. 3,000 - 8,000 per tooth',
    duration: '30-60 minutes',
    details: 'We use high-quality materials that match your natural teeth.'
  },
  rootCanal: {
    name: 'Root Canal Treatment',
    description: 'Save an infected tooth by removing infected pulp and sealing the tooth.',
    price: 'Rs. 8,000 - 20,000',
    duration: '1-2 hours',
    details: 'Painless procedure with modern anesthesia. Over 95% success rate.'
  },
  extraction: {
    name: 'Tooth Extraction',
    description: 'Safe and gentle removal of damaged or problematic teeth.',
    price: 'Rs. 2,500 - 8,000',
    duration: '15-60 minutes',
    details: 'Includes aftercare instructions for smooth recovery.'
  },
  crown: {
    name: 'Dental Crowns',
    description: 'Custom-made caps to protect and restore damaged teeth.',
    price: 'Rs. 12,000 - 25,000',
    duration: '2 visits',
    details: 'Durable and natural-looking. Lasts 10-15 years with proper care.'
  },
  implant: {
    name: 'Dental Implants',
    description: 'Permanent tooth replacement with titanium posts and natural-looking crowns.',
    price: 'Rs. 60,000 - 120,000',
    duration: '3-6 months (including healing)',
    details: 'The gold standard for replacing missing teeth. Lifetime solution.'
  },
  braces: {
    name: 'Braces / Orthodontics',
    description: 'Straighten teeth and correct bite issues with traditional or clear braces.',
    price: 'Rs. 80,000 - 300,000',
    duration: '12-24 months',
    details: 'Options include metal braces, ceramic braces, and Invisalign.'
  },
  veneer: {
    name: 'Dental Veneers',
    description: 'Transform your smile with thin porcelain shells for front teeth.',
    price: 'Rs. 15,000 - 35,000 per tooth',
    duration: '2-3 visits',
    details: 'Fix chips, gaps, stains, and misshapen teeth. Lasts 10-20 years.'
  },
  wisdom: {
    name: 'Wisdom Tooth Removal',
    description: 'Safe extraction of problematic wisdom teeth.',
    price: 'Rs. 5,000 - 15,000 per tooth',
    duration: '30-90 minutes',
    details: 'Sedation options available for anxious patients.'
  },
  dentures: {
    name: 'Dentures',
    description: 'Replace multiple missing teeth with comfortable removable dentures.',
    price: 'Rs. 15,000 - 80,000',
    duration: 'Multiple visits',
    details: 'Full and partial dentures available. Custom-fitted for comfort.'
  }
}

// ============================================
// RESPONSE TEMPLATES
// ============================================

export const responses = {
  greeting: [
    `Hello! I'm Sara, your dental care assistant at ${chatbotConfig.clinicName}. How can I help you today?`,
    `Hi there! Welcome to ${chatbotConfig.clinicName}. I'm Sara, here to assist you. What can I do for you?`,
    `Assalam o Alaikum! I'm Sara from ${chatbotConfig.clinicName}. How may I assist you today?`
  ],

  appointment: `Great! I can help you book an appointment.

**For quick online booking with instant confirmation:**
👉 [Click here to Book Online](/book-appointment)

**Or I can help you book right here!**
Just type "book now" to start the booking process.

Which would you prefer?`,

  services: `We offer comprehensive dental services:

**Preventive Care:**
• Teeth Cleaning & Checkups
• Deep Cleaning (Scaling)

**Restorative:**
• Fillings & Root Canals
• Crowns & Bridges
• Dentures & Implants

**Cosmetic:**
• Teeth Whitening
• Veneers & Smile Makeover

**Orthodontics:**
• Braces & Aligners

**Surgery:**
• Extractions & Wisdom Teeth

Which service interests you? Just ask!`,

  hours: `**Our Clinic Hours:**

📅 Monday - Friday: 9:00 AM - 6:00 PM
📅 Saturday: 9:00 AM - 2:00 PM
📅 Sunday: CLOSED

📞 Emergency Line: ${chatbotConfig.emergencyPhone}
(Available after hours for emergencies)

Would you like to book an appointment?`,

  location: `**Find Us At:**

📍 ${chatbotConfig.address}

**Getting Here:**
• Free parking available
• Near main intersection
• Easily accessible by public transport

📞 Need directions? Call us: ${chatbotConfig.phone}

[Get Directions on Google Maps](https://maps.google.com)`,

  contact: `**Contact Us:**

📞 Phone: ${chatbotConfig.phone}
🚨 Emergency: ${chatbotConfig.emergencyPhone}
📧 Email: ${chatbotConfig.email}
📍 Address: ${chatbotConfig.address}

**Hours:** Mon-Fri 9AM-6PM, Sat 9AM-2PM

How else can I help you?`,

  cost: `**Our Services are Affordable:**

• Cleaning: Rs. 2,000 - 4,000
• Fillings: Rs. 3,000 - 8,000
• Root Canal: Rs. 8,000 - 20,000
• Crowns: Rs. 12,000 - 25,000
• Whitening: Rs. 8,000 - 15,000
• Implants: Rs. 60,000 - 120,000

**Payment Options:**
✓ Cash, Credit/Debit Cards
✓ Bank Transfer
✓ EasyPaisa / JazzCash
✓ 0% Interest Payment Plans

Which treatment's pricing do you need?`,

  anxiety: `I completely understand - many people feel nervous about dental visits. You're not alone!

**We make it easy:**
✓ Gentle, patient approach
✓ We explain everything first
✓ Take breaks whenever needed
✓ Comfortable environment
✓ Sedation options available

Many patients tell us: "It was much easier than I expected!"

Would you like to schedule a consultation? We can go at your pace.`,

  emergency: `🚨 **DENTAL EMERGENCY?**

**Call immediately:** ${chatbotConfig.emergencyPhone}

**While waiting:**
• For pain: Take ibuprofen
• For bleeding: Apply pressure with gauze
• Knocked out tooth: Keep in milk, come ASAP
• Broken tooth: Save pieces, avoid chewing

**We handle:**
• Severe toothache
• Broken/knocked out teeth
• Swelling or infection
• Bleeding

Don't wait - call now!`,

  pain: `I'm sorry you're in pain. Let me help:

**For immediate relief:**
• Take ibuprofen or Panadol
• Rinse with warm salt water
• Apply cold compress
• Avoid hot/cold foods

**When to seek immediate care:**
• Severe, throbbing pain
• Swelling or fever
• Can't eat or sleep

📞 Call us: ${chatbotConfig.phone}
🚨 Emergency: ${chatbotConfig.emergencyPhone}

Would you like to book an urgent appointment?`,

  thanks: [
    "You're welcome! Is there anything else I can help you with?",
    "My pleasure! Let me know if you have any other questions.",
    "Happy to help! Anything else you'd like to know?"
  ],

  bye: [
    `Thank you for chatting! Take care and don't forget to smile. 😊 Call us anytime: ${chatbotConfig.phone}`,
    `Goodbye! We're here whenever you need us. Take care of those teeth!`,
    `See you soon! Remember, we're just a call away: ${chatbotConfig.phone}`
  ],

  human: `I understand you'd like to speak with someone directly.

📞 **Call us:** ${chatbotConfig.phone}
📧 **Email:** ${chatbotConfig.email}
⏰ **Hours:** Mon-Fri 9AM-6PM, Sat 9AM-2PM

Our team responds within 1-2 hours during business hours.

Is there something specific I can try to help with first?`,

  fallback: `I'm not sure I understood that correctly. Let me help you with what I do best:

• **Book an appointment** - type "appointment"
• **Our services** - type "services"
• **Clinic hours** - type "hours"
• **Emergency help** - type "emergency"
• **Contact info** - type "contact"
• **Pricing** - type "cost"

Or just describe what you're looking for!`,

  bookNow: `Let's book your appointment!

**What type of visit do you need?**

1️⃣ Regular Checkup & Cleaning
2️⃣ Toothache / Pain
3️⃣ Cosmetic (Whitening, Veneers)
4️⃣ Braces Consultation
5️⃣ Emergency
6️⃣ Other / General

Just type the number or describe your need.`
}

// ============================================
// APPOINTMENT FLOW CONFIG
// ============================================

export const appointmentFlow = {
  steps: ['type', 'date', 'time', 'contact', 'confirm'],

  messages: {
    start: responses.bookNow,
    cancelled: "No problem! Let me know if you need anything else."
  }
}
