const mongoose = require('mongoose');
const Service = require('../models/Service');
const User = require('../models/User');
const connectDB = require('../config/database');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Check if services already exist
    const servicesCount = await Service.countDocuments();

    if (servicesCount === 0) {
      console.log('Seeding initial services...');

      const services = [
        {
          name: 'Dental Checkup',
          description: 'Comprehensive oral health examination including X-rays if needed. Our dentists will assess your dental health and recommend personalized treatment options.',
          price: 1500,
          duration: '30 minutes'
        },
        {
          name: 'Teeth Cleaning',
          description: 'Professional dental cleaning to remove plaque, tartar, and stains. Recommended every 6 months for optimal oral health.',
          price: 2500,
          duration: '30 minutes'
        },
        {
          name: 'Teeth Whitening',
          description: 'Professional teeth whitening treatment to brighten your smile by several shades using safe, effective whitening agents.',
          price: 8000,
          duration: '45 minutes'
        },
        {
          name: 'Root Canal Treatment',
          description: 'Painless root canal therapy to save infected or damaged teeth. Includes cleaning, filling, and sealing the root canal.',
          price: 15000,
          duration: '60 minutes'
        },
        {
          name: 'Dental Implants',
          description: 'Permanent replacement for missing teeth with titanium implants and natural-looking crowns.',
          price: 45000,
          duration: '90 minutes'
        },
        {
          name: 'Dental Filling',
          description: 'Composite or amalgam filling for cavities. Restores tooth function and prevents further decay.',
          price: 3500,
          duration: '30 minutes'
        },
        {
          name: 'Dental Braces',
          description: 'Orthodontic treatment to straighten teeth and correct bite issues. Includes metal or ceramic braces options.',
          price: 80000,
          duration: '45 minutes'
        },
        {
          name: 'Tooth Extraction',
          description: 'Safe and painless removal of damaged or problematic teeth, including wisdom teeth extraction.',
          price: 5000,
          duration: '30 minutes'
        },
        {
          name: 'Dental Crown',
          description: 'Custom-made crown to restore damaged or weakened teeth. Made from porcelain or ceramic for natural appearance.',
          price: 18000,
          duration: '60 minutes'
        }
      ];

      await Service.insertMany(services);
      console.log('✅ Services seeded successfully!');
    } else {
      console.log('✅ Services already exist, skipping...');
    }

    // Check if admin user exists
    const adminExists = await User.findOne({ email: 'admin@ahmeddental.com' });

    if (!adminExists) {
      console.log('Creating admin user...');

      const adminUser = new User({
        name: 'Dr. Ahmed Khan',
        email: 'admin@ahmeddental.com',
        password: 'admin123',
        phone: '+92 301 2345678',
        role: 'admin'
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@ahmeddental.com');
      console.log('🔑 Password: admin123');
      console.log('⚠️  Please change the password after first login!');
    } else {
      console.log('✅ Admin user already exists, skipping...');
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n💡 To test the application:');
    console.log('   - Visit: http://localhost:5000');
    console.log('   - Login as admin using credentials above');
    console.log('   - Or book an appointment as a new patient');

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

seedData();
