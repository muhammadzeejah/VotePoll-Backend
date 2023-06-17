const mongoose = require('mongoose').set('debug', true);

const MailsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'The name is required'],
  },
  email: {
    type: String,
    required: [true, 'The email is required'],
  },
  mobile: {
    type: String,
    required: [true, 'The mobile number is required'],
  },
  message: {
    type: String,
    required: [true, 'The message is required'],
  },
});
const queries = mongoose.model('queries', MailsSchema);
module.exports = queries;
