const express = require('express');
const Leave = require('../models/Leave');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Submit leave application
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, numberOfDays, reason } = req.body;

    if (!leaveType || !fromDate || !toDate || !numberOfDays || !reason) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const leave = new Leave({
      employeeId: req.user.id,
      leaveType,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      numberOfDays,
      reason,
      status: 'pending'
    });

    await leave.save();
    res.status(201).json({ message: 'Leave application submitted', leave });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's leave applications
router.get('/my-leaves', authMiddleware, async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.user.id }).sort({ createdAt: -1 });
    const stats = {
      total: leaves.length,
      approved: leaves.filter(l => l.status === 'approved').length,
      rejected: leaves.filter(l => l.status === 'rejected').length,
      pending: leaves.filter(l => l.status === 'pending').length
    };
    res.json({ leaves, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all leave applications (admin)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('employeeId', 'name email department')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific leave application
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate('employeeId');
    
    // Check if user owns this leave or is admin
    if (leave.employeeId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(leave);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update leave status (admin approval)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, approverComments } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status,
        approverComments,
        approverId: req.user.id,
        updatedAt: Date.now()
      },
      { new: true }
    );

    res.json({ message: 'Leave status updated', leave });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Withdraw leave (user)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (leave.employeeId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ error: 'Can only withdraw pending applications' });
    }

    await Leave.findByIdAndDelete(req.params.id);
    res.json({ message: 'Leave application withdrawn' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
