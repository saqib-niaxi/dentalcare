const Service = require('../models/Service');

// @desc    Get all services
// @route   GET /api/services
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ name: 1 });
    res.json({
      success: true,
      services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new service (admin only)
// @route   POST /api/services
exports.createService = async (req, res) => {
  try {
    const { name, description, price, duration } = req.body;

    const service = new Service({
      name,
      description,
      price,
      duration
    });

    await service.save();

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update service (admin only)
// @route   PUT /api/services/:id
exports.updateService = async (req, res) => {
  try {
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      message: 'Service updated successfully',
      service: updatedService
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete service (admin only)
// @route   DELETE /api/services/:id
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    await service.deleteOne();

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
