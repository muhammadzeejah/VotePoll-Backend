const mongoose = require('mongoose').set('debug', true);

const CitizensSchema = new mongoose.Schema({
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
});
const Citizens = mongoose.model('Citizens', CitizensSchema);
module.exports = Citizens;
