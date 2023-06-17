const mongoose = require('mongoose');

const consituencySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required for consituency!'],
  },
  seatType: {
    type: String,
    required: [true, 'Leader name is required for consituency!'],
  },
  halka: {
    type: String,
    required: [true, 'halka is required for consituency!'],
  },
  province: {
    type: String,
    required: [true, 'Province name is required for consituency!'],
  },
  division: {
    type: String,
    required: [true, 'Division is required for consituency!'],
  },
  unionCouncils: {
    type: [String],
    required: [true, 'Union Councils list is required for consituency'],
  },
});

const Consituency = mongoose.model('Consituency', consituencySchema);

module.exports = Consituency;
