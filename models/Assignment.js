const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'Subject is required.'],
      trim: true,
      maxlength: [80, 'Subject cannot be longer than 80 characters.']
    },
    title: {
      type: String,
      required: [true, 'Title is required.'],
      trim: true,
      maxlength: [120, 'Title cannot be longer than 120 characters.']
    },
    description: {
      type: String,
      required: [true, 'Description is required.'],
      trim: true,
      maxlength: [1000, 'Description cannot be longer than 1000 characters.']
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required.']
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Pending',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
