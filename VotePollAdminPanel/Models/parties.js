const mongoose = require('mongoose');

const partySchema = new mongoose.Schema({
  logo: {
    type: String,
    required: [true, 'Logo is required for party!'],
  },
  name: {
    type: String,
    required: [true, 'Name is required for party!'],
  },
  leader: {
    type: String,
    required: [true, 'Leader name is required for party!'],
  },
  leaderPicture: {
    type: String,
    required: [true, 'Leader picture is required for party!'],
  },
  president: {
    type: String,
    required: [true, 'President name is required for party!'],
  },
  manifesto: {
    type: String,
    required: [true, 'Manifesto is required for party!'],
  },
  description: {
    type: String,
    required: [true, 'Description is required for party'],
  },
  postalAddress: {
    type: String,
    required: [true, 'Postal Address is reequired for party'],
  },
});
const Party = mongoose.model('Party', partySchema);

module.exports = Party;
