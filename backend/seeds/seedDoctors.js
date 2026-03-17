const Doctor = require('../models/Doctor');
const Service = require('../models/Service');

const seedDoctors = async () => {
  try {
    // Check if doctors already exist
    const doctorsCount = await Doctor.countDocuments();

    if (doctorsCount > 0) {
      console.log('✅ Doctors already exist, skipping doctor seeding...');
      return;
    }

    console.log('Seeding doctors...');

    // Fetch all services to assign to doctors
    const services = await Service.find();

    if (services.length === 0) {
      console.log('⚠️  No services found. Please run service seeding first.');
      return;
    }

    // Find specific services for each doctor
    const dentalCheckup = services.find(s => s.name === 'Dental Checkup');
    const teethCleaning = services.find(s => s.name === 'Teeth Cleaning');
    const teethWhitening = services.find(s => s.name === 'Teeth Whitening');
    const rootCanal = services.find(s => s.name === 'Root Canal Treatment');
    const dentalImplants = services.find(s => s.name === 'Dental Implants');
    const dentalFilling = services.find(s => s.name === 'Dental Filling');
    const dentalBraces = services.find(s => s.name === 'Dental Braces');
    const toothExtraction = services.find(s => s.name === 'Tooth Extraction');
    const dentalCrown = services.find(s => s.name === 'Dental Crown');

    const doctors = [
      {
        name: 'Dr. Hanif Niazi Khan',
        email: 'ahmed@ahmeddental.com',
        phone: '+92 320 2067666',
        photo: 'doctor-ahmed.jpg',
        bio: 'Chief Dentist with 15+ years of experience in general dentistry and orthodontics. Specializes in braces and smile makeovers.',
        specialization: 'Orthodontist',
        experience: 15,
        qualifications: ['BDS', 'MDS Orthodontics', 'FCPS'],
        rating: 4.8,
        services: [
          dentalCheckup?._id,
          teethCleaning?._id,
          dentalBraces?._id,
          dentalFilling?._id
        ].filter(Boolean),
        workingDays: {
          monday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          tuesday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          wednesday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          thursday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          friday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
          saturday: { isWorking: true, start: '09:00', end: '14:00' },
          sunday: { isWorking: false }
        }
      },
      {
        name: 'Dr. Sara Malik',
        email: 'sara@ahmeddental.com',
        phone: '+92 321 1234567',
        photo: 'doctor-sara.jpg',
        bio: 'Specialist in cosmetic dentistry with a passion for creating beautiful smiles. Expert in teeth whitening and veneers.',
        specialization: 'Cosmetic Dentist',
        experience: 8,
        qualifications: ['BDS', 'Certification in Cosmetic Dentistry', 'Advanced Aesthetic Dentistry'],
        rating: 4.9,
        services: [
          dentalCheckup?._id,
          teethWhitening?._id,
          dentalCrown?._id,
          dentalFilling?._id
        ].filter(Boolean),
        workingDays: {
          monday: { isWorking: true, start: '10:00', end: '17:00', breakStart: '13:00', breakEnd: '14:00' },
          tuesday: { isWorking: true, start: '10:00', end: '17:00', breakStart: '13:00', breakEnd: '14:00' },
          wednesday: { isWorking: true, start: '10:00', end: '17:00', breakStart: '13:00', breakEnd: '14:00' },
          thursday: { isWorking: true, start: '10:00', end: '17:00', breakStart: '13:00', breakEnd: '14:00' },
          friday: { isWorking: true, start: '10:00', end: '17:00', breakStart: '13:00', breakEnd: '14:00' },
          saturday: { isWorking: true, start: '09:00', end: '13:00' },
          sunday: { isWorking: false }
        }
      },
      {
        name: 'Dr. Hassan Ali',
        email: 'hassan@ahmeddental.com',
        phone: '+92 322 9876543',
        photo: 'doctor-hassan.jpg',
        bio: 'Expert in oral surgery and dental implants with 12+ years of experience. Committed to painless procedures and patient comfort.',
        specialization: 'Oral Surgeon',
        experience: 12,
        qualifications: ['BDS', 'MDS Oral Surgery', 'Fellowship in Implantology'],
        rating: 4.7,
        services: [
          rootCanal?._id,
          toothExtraction?._id,
          dentalImplants?._id,
          dentalCrown?._id
        ].filter(Boolean),
        workingDays: {
          monday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '12:00', breakEnd: '13:00' },
          tuesday: { isWorking: false },
          wednesday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '12:00', breakEnd: '13:00' },
          thursday: { isWorking: false },
          friday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '12:00', breakEnd: '13:00' },
          saturday: { isWorking: true, start: '09:00', end: '15:00' },
          sunday: { isWorking: false }
        }
      }
    ];

    await Doctor.insertMany(doctors);
    console.log('✅ Doctors seeded successfully!');
    console.log(`   - ${doctors.length} doctors added`);
    doctors.forEach(doc => {
      console.log(`   - ${doc.name} (${doc.specialization})`);
    });

  } catch (error) {
    console.error('❌ Error seeding doctors:', error.message);
    throw error;
  }
};

module.exports = seedDoctors;
