const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Election Type is required to register elections!'],
  },
  status: {
    type: String,
    required: [true, 'Status is required to register elections!'],
  },
  startTime: {
    type: Date,
    required: [true, 'Date is required to register elections!'],
  },
  endTime: {
    type: Date,
    required: [true, 'Date is required to register elections!'],
  },
  area: {
    type: [String]
  }
});

const Election = mongoose.model('Election', electionSchema);

module.exports = Election;
