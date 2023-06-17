const AppError = require('../../utils/appError');
const voterModel = require('../Models/voter');
const catchAsync = require('../../utils/catchAsync');

exports.getVoterStatus = catchAsync(async (req, res, next) => {
    const voter = await voterModel.findOne({ cnic: req.params.id });
    if (!voter) {
      return next(new AppError('No voter found with that ID', 404));
    }
    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
        voter,
    });
  });

exports.update = catchAsync(async (req, res) => {
    const cnic = req.params.id;
    const {electionAppearence} = req.body;
    if(!cnic || !electionAppearence) {
        return next(new AppError('Cnic and electionAppearence object is required', 404));
    }
    const election = {
        generalElections : electionAppearence.generalElections,
        provincialElections : electionAppearence.provincialElections,
        localBodyElections : electionAppearence.localBodyElections
    }
    await voterModel.findOneAndUpdate(
        {cnic: cnic},
        {
          cnic: cnic,
          electionAppearence: election,
        },
        {
          new: true,
          runValidators: true,
        }
      );
    return res.status(200).json({
        status: 'Success',
    });
});