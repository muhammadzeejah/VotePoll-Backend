const citizenModel = require('../Models/citizens');
const Election = require('./../../VotePollAdminPanel/Models/elections');
const Candidate = require('./../../VotePollAdminPanel/Models/candidate');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const APIFeatures = require('../../utils/apiFeatures');
const Consituency = require('../../VotePollAdminPanel/Models/consituencies');

exports.create = catchAsync(async (req, res, next) => {
  const { cnic, gender, photo, firstName, lastName, fatherName, country, province, division, district, tehsil, unionCouncil, dob, doi, doe, permanentAddress, cell, faceDescriptor} = req.body;
  if (!cnic || !gender || !photo || !firstName || !lastName || !fatherName || !country || !province || !division || !district || !tehsil || !unionCouncil || !dob || !doi || !doe || !permanentAddress || !cell || !faceDescriptor) {
    return next(new AppError('Please enter all the required fields to register a citizen', 400));
  }
  let citizenInfo = {cnic, gender, photo, firstName, lastName, fatherName, country, province, division, district, tehsil, unionCouncil, dob, doi, doe, permanentAddress, cell, faceDescriptor}
  const citizen = await citizenModel.create(citizenInfo);
  return res.status(200).json({
    status: 'Success',
    citizen: citizen
  });
});

exports.getCitizen = catchAsync(async (req, res, next) => {
  const citizen = await citizenModel.findOne({ cnic: req.params.id });
  if (!citizen) {
    return next(new AppError('No citizen found with that ID', 404));
  }
  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    Citizen: {
      citizen,
    },
  });
});

exports.getAllCitizen = catchAsync(async (req, res, next) => {
  let page = 1;
  let limit = 10;
  let count;
  if (isNaN(req.query.page) || isNaN(req.query.limit)) {
    return next(new AppError('Please enter a valid page and limit', 400));
  }
  const features = await new APIFeatures(citizenModel.find(), req.query).paginate();
  if (features.queryString.page) {
    page = features.queryString.page;
    limit = features.queryString.limit;
    const skip = (page - 1) * limit;
    count = await citizenModel.countDocuments();
    if (skip >= count) {
      return next(new AppError('This page doesnot exist', 400));
    }
  }
  const citizens = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    limit: limit,
    page: page,
    total: count,
    data: {
      citizens,
    },
  });
});

exports.getCitizens = catchAsync(async (req, res, next) => {
  const citizens = await citizenModel.find({ faceDescriptor: { $exists: true } });
  let editedCitizens;
  if(citizens.length) {
   editedCitizens = citizens.map(c => {return {cnic: c.cnic, faceDescriptor: c.faceDescriptor.split(',')}});
  }
  // console.log(editedCitizens[0].faceDescriptor.split(','));
  // SEND RESPONSE
  res.status(200).json({
    data: {
      editedCitizens,
    },
  });
});

exports.getElections = catchAsync(async (req, res, next) => {
  const citizen = await citizenModel.findOne({ cnic: req.params.id });

  if (!citizen) {
    return next(new AppError('No citizen found with that ID', 404));
  }

  const electionObj = {
    GeneralElections: false,
    ProvincialElections: false,
    LocalBodyElections: false,
  };

  const GeneralElections = await Election.findOne({ type: 'NATIONAL', status: 'OPEN' });
  if (GeneralElections) electionObj.GeneralElections = GeneralElections;

  const ProvincialElections = await Election.find({ type: 'PROVINCIAL', status: 'OPEN', area: citizen.province });
  console.log(ProvincialElections)
  if (ProvincialElections.length) electionObj.ProvincialElections = ProvincialElections;


  const LocalBodyElections = await Election.find({ status: 'OPEN', type: 'LOCAL' });
  if (LocalBodyElections.length) {
    for (let i = 0; i < LocalBodyElections.length; i++) {
      for (let j = 0; i < LocalBodyElections[i].area.length; j++) {
        const consituency = await Consituency.findOne({ halka: LocalBodyElections[i].area[j] });
        if (consituency) {
          // if (consituency.unionCouncils.includes(citizen.unionCouncil)) {
            electionObj.LocalBodyElections = LocalBodyElections[i];
            console.log(electionObj.LocalBodyElections)
            break;
          // }
        }
      }
    }
  }

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    Elections: {
      electionObj,
    },
  });
});

exports.getGeneralCandidate = catchAsync(async (req, res, next) => {
  const citizen = await citizenModel.findOne({ cnic: req.params.id });
  if (!citizen) {
    return next(new AppError('No citizen found with that ID', 404));
  }
  const consituency = await Consituency.findOne({ unionCouncils: { $all: [citizen.unionCouncil] }, seatType: "MNA" })
  if (!consituency) {
    return next(new AppError('No consituency found for the given citizens union council', 404));
  }
  const candidate = await Candidate.find({ 'consituencies.halka': consituency.halka })

  if (candidate.length <= 0) {
    return next(new AppError('No candidate found for the given citizens union council', 404));
  }
  // SEND RESPONSE
  return res.status(200).json({
    status: 'success',
    Candidate: candidate,
  });
});

exports.getProvisionalCandidate = catchAsync(async (req, res, next) => {
  const citizen = await citizenModel.findOne({ cnic: req.params.id });
  if (!citizen) {
    return next(new AppError('No citizen found with that ID', 404));
  }
  const consituency = await Consituency.findOne({ unionCouncils: { $all: [citizen.unionCouncil] }, seatType: "MPA" })
  if (!consituency) {
    return next(new AppError('No consituency found for the given citizens union council', 404));
  }
  const candidate = await Candidate.find({ 'consituencies.halka': consituency.halka })
  if (candidate.length <= 0) {
    return next(new AppError('No candidate found for the given citizens union council', 404));
  }
  // SEND RESPONSE
  return res.status(200).json({
    status: 'success',
    Candidate: candidate,
  });
});

exports.getLocalCandidate = catchAsync(async (req, res, next) => {
  const citizen = await citizenModel.findOne({ cnic: req.params.id });
  if (!citizen) {
    return next(new AppError('No citizen found with that ID', 404));
  }
  const consituency = await Consituency.findOne({ unionCouncils: { $all: [citizen.unionCouncil] }, seatType: "Chairman" || "Counsellor" })
  if (!consituency) {
    return next(new AppError('No consituency found for the given citizens union council', 404));
  }

  const candidate = await Candidate.find({ 'consituencies.halka': consituency.halka })
  if (candidate.length <= 0) {
    return next(new AppError('No candidate found for the given citizens union council', 404));
  }
  // SEND RESPONSE
  return res.status(200).json({
    status: 'success',
    Candidate: candidate,
  });
});