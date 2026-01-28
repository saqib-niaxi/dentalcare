const mongoose = require('mongoose');
const Service = require('../models/Service');
const connectDB = require('../config/database');
require('dotenv').config();

const addConsultationService = async () => {
  try {
    await connectDB();

    // Check if consultation service already exists
    const exists = await Service.findOne({
      name: { $regex: /checkup|consultation/i }
    });

    if (exists) {
      console.log('Consultation/Checkup service already exists:', exists.name);
    } else {
      const consultation = new Service({
        name: 'Dental Checkup',
        description: 'Comprehensive oral health examination including X-rays if needed. Our dentists will assess your dental health and recommend personalized treatment options.',
        price: 1500,
        duration: '30 minutes'
      });

      await consultation.save();
      console.log('Dental Checkup service added successfully!');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

addConsultationService();
