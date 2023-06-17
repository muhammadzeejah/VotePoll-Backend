var validator = require('email-validator');
const mailsModel = require('../Models/queries');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const sendEmail = require('../../utils/email');

exports.contactUs = catchAsync(async (req, res, next) => {
  const validEmail = validator.validate(req.body.email);
  if (!validEmail) {
    return next(new AppError('Invalid Email', 400));
  }
  const { name, email, phone_no, message } = req.body;
  if (!name || !email || !phone_no || !message) {
    return next(new AppError('Please provide name, email, phone_no, and message!', 400));
  }
  const mailMessage = `Name: ${name}, Email: ${email}, Phone No: ${phone_no}, Query: ${message}`;

  const mailObj = await sendEmail({
    email: 'muhammadzeejah1122@gmail.com',
    subject: 'Query about the voting system',
    message: mailMessage
  });
  if (!mailObj) {
    return next(new AppError('Fail, Email not sent', 400));
  }
  const query = {
    name: name,
    email: email,
    mobile: phone_no,
    message: message,
  }
  await mailsModel.create(query);
  return res.status(200).json({
    status: 'Success',
  });
});
