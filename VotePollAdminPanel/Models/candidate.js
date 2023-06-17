const mongoose = require('mongoose');
// year, seat
const candidateSchema = new mongoose.Schema({
  citizen: {
    cnic: {
      type: String,
      required: [true, 'The cnic is required'],
    },
    firstName: {
      type: String,
      required: [true, 'The firstName is required'],
    },
    lastName: {
      type: String,
      required: [true, 'The lastName is required'],
    },
    gender: {
      type: String,
      required: [true, 'The gender is required'],
    },
    fatherName: {
      type: String,
      required: [true, 'The fatherName is required'],
    },
    country : {
      type: String,
      required: [true, 'The Country is required'],
    },
    province : {
      type: String,
      required: [true, 'The Province is required'],
    },
    division : {
      type: String,
      required: [true, 'The Division is required'],
    },
    district : {
      type: String,
      required: [true, 'The District is required'],
    },
    tehsil : {
      type: String,
      required: [true, 'The Tehsil is required'],
    },
    unionCouncil : {
      type: String,
      required: [true, 'The UnionCouncil is required'],
    },
    dob : {
      type: String,
      required: [true, 'The dob is required'],
    },
    doi : {
      type: String,
      required: [true, 'The doi is required'],
    },
    doe : {
      type: String,
      required: [true, 'The doe is required'],
    },
    permanentAddress : {
      type: String,
      required: [true, 'The permanentAddress is required'],
    },
    photo : {
      type: String,
      // required: [true, 'The photo is required'],
    },
    faceDescriptor : {
      type: String,
      required: [true, 'The faceDescriptor is required'],
    },
    cell : {
      type: String,
      required: [true, 'The cell is required'],
    },
  },
  assets: {
    type: String,
    required: [true, 'The assets is required'],
  },
  party: {
    _id: String,
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
  },
  consituencies: [{
    _id: String,
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
  }],
});

const Candidate = mongoose.model('Candidate', candidateSchema);

module.exports = Candidate;
