require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Assignment = require('./models/Assignment');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_assignment_manager';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// READ: Return all assignments, optionally filtered by Pending or Completed status.
app.get('/api/assignments', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status && req.query.status !== 'All') {
      if (!['Pending', 'Completed'].includes(req.query.status)) {
        return res.status(400).json({ message: 'Status must be Pending or Completed.' });
      }
      filter.status = req.query.status;
    }

    const assignments = await Assignment.find(filter).sort({ deadline: 1, createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Could not load assignments.', error: error.message });
  }
});

// CREATE: Save a new assignment document.
app.post('/api/assignments', async (req, res) => {
  try {
    const assignment = await Assignment.create(req.body);
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ message: 'Could not add assignment.', error: error.message });
  }
});

// READ: Return one assignment document by its MongoDB ID.
app.get('/api/assignments/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }
    res.json(assignment);
  } catch (error) {
    res.status(400).json({ message: 'Invalid assignment ID.', error: error.message });
  }
});

// UPDATE: Replace editable assignment fields.
app.put('/api/assignments/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }
    res.json(assignment);
  } catch (error) {
    res.status(400).json({ message: 'Could not update assignment.', error: error.message });
  }
});

// UPDATE: Change an assignment between Pending and Completed.
app.patch('/api/assignments/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Pending or Completed.' });
    }

    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }
    res.json(assignment);
  } catch (error) {
    res.status(400).json({ message: 'Could not change assignment status.', error: error.message });
  }
});

// DELETE: Remove an assignment document.
app.delete('/api/assignments/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }
    res.json({ message: 'Assignment deleted successfully.' });
  } catch (error) {
    res.status(400).json({ message: 'Could not delete assignment.', error: error.message });
  }
});

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');
    app.listen(PORT, () => {
      console.log(`Student Assignment Manager is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Could not connect to MongoDB:', error.message);
    process.exit(1);
  }
}

startServer();
