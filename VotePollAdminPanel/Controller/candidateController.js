const Candidate = require('./../Models/candidate');
const Consituency = require('./../Models/consituencies');
const Party = require('./../Models/parties');
const Citizen = require('./../../VotePollWebsite/Models/citizens');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const APIFeatures = require('../../utils/apiFeatures');
const mongoose = require('mongoose')


exports.getAllCandidates = catchAsync(async (req, res, next) => {
  let page = 1;
  let limit = 10;
  let count;
  if (isNaN(req.query.page) || isNaN(req.query.limit)) {
    return next(new AppError('Please enter a valid page and limit', 400));
  }
  const features = await new APIFeatures(Candidate.find(), req.query).paginate();
  if (features.queryString.page) {
    page = features.queryString.page;
    limit = features.queryString.limit;
    const skip = (page - 1) * limit;
    count = await Candidate.countDocuments();
    if (skip >= count) {
      return next(new AppError('This page doesnot exist', 400));
    }
  }
  const candidates = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    length: candidates.length,
    limit: limit,
    page: page,
    total: count,
    data: {
      candidates,
    },
  });
});

exports.getCandidates = catchAsync(async (req, res, next) => {
  const candidates = await Candidate.find();

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    data: {
      candidates,
    },
  });
});

exports.getCandidate = catchAsync(async (req, res, next) => {
  const candidate = await Candidate.findById(req.params.id);
  if (!candidate) {
    return next(new AppError('No candidate found with that ID', 404));
  }
  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    data: {
      candidate,
    },
  });
});

exports.create = catchAsync(async (req, res, next) => {
  const { citizenId, partyId, assets } =
    req.body;
  const consituencyIds = req.body.consituencyIds;
  if (
    !citizenId || !consituencyIds.length || !partyId || !assets
  ) {
    return next(
      new AppError(
        'Please enter all the required fields to register a Candidate',
        400
      )
    );
  }
  let i = 0;
  for ( i = 0; i < consituencyIds.length ; i++) {
    if (!mongoose.isValidObjectId(consituencyIds[i])) {
      return next(new AppError('Please enter valid ids of citizen, consituency, party', 400));
    }
  }

  const hasDuplicates = (arr) => arr.length !== new Set(arr).size;
  if (hasDuplicates(consituencyIds)) {
    return next(new AppError('Duplication of consituency Ids', 400));
  }

  if (!mongoose.isValidObjectId(partyId)) {
    return next(new AppError('Please enter valid ids of party', 400));
  }

  let citizen = await Citizen.findOne({cnic: citizenId});
  if (!citizen) {
    return next(new AppError('Citizen donot exist with this id. please try again', 404));
  }

  let party = await Party.findById(partyId);
 
  if (!party) {
    return next(new AppError('Party donot exist with this id. please try again', 404));
  }

  let consituencies = [];
  for ( i = 0; i < consituencyIds.length; i++) {
    let consituency = await Consituency.findById(consituencyIds[i]);
    if (!consituency) {
      return next(new AppError(`Consituency donot exist with this id (${consituencyIds[i]}). please try again`, 404));
    } else {
      consituencies.push(consituency)
      consituency = {};
    }
  }

  const query = {
    $or: [
      { "citizen.cnic": citizen.cnic }
    ],
  };

  const candidateExisted = await Candidate.exists(query);
  if (candidateExisted) {
    return next(
      new AppError(
        'Candidate already existed with similar details, Please enter diffrent details',
        400
      )
    );
  }
  const candidate = { citizen, party, consituencies, assets };
  await Candidate.create(candidate);
  return res.status(201).json({
    status: 'Success',
    candidate,
  });
});

exports.update = catchAsync(async (req, res, next) => {
  const { citizenId, partyId, assets } =
    req.body;
  const consituencyIds = req.body.consituencyIds;
  if (
    !citizenId || !consituencyIds.length || !partyId || !assets
  ) {
    return next(
      new AppError(
        'Please enter all the required fields to register a Candidate',
        400
      )
    );
  }

  let i = 0;
  for ( i = 0; i < consituencyIds.length ; i++) {
    if (!mongoose.isValidObjectId(consituencyIds[i])) {
      return next(new AppError('Please enter valid ids of consituency', 400));
    }
  }
  const hasDuplicates = (arr) => arr.length !== new Set(arr).size;
  if (hasDuplicates(consituencyIds)) {
    return next(new AppError('Duplication of consituency Ids', 400));
  }

  if (!mongoose.isValidObjectId(partyId)) {
    return next(new AppError('Please enter valid ids of party', 400));
  }

  const citizen = await Citizen.findOne({cnic: citizenId});
  if (!citizen) {
    return next(new AppError('Citizen donot exist with this id. please try again', 404));
  }
  let consituencies = [];
  for ( i = 0; i < consituencyIds.length; i++) {
    let consituency = await Consituency.findById(consituencyIds[i]);
    if (!consituency) {
      return next(new AppError(`Consituency donot exist with this id (${consituencyIds[i]}). please try again`, 404));
    } else {
      consituencies.push(consituency)
      consituency = {};
    }
  }

  const party = await Party.findById(partyId);
  if (!party) {
    return next(new AppError('Party donot exist with this id. please try again', 404));
  }

  const candidate = { citizen, party, consituencies, assets };
  const newCandidate = await Candidate.findByIdAndUpdate(
    req.params.id,
    candidate,
    {
      new: true,
      runValidators: true,
    }
  );
  return res.status(201).json({
    status: 'Success',
    newCandidate,
  });
});

exports.delete = catchAsync(async (req, res, next) => {
  if (!req.params.id) {
    return next(
      new AppError('Specify ID of the candidate you want to delete', 400)
    );
  }
  const candidate = await Candidate.findByIdAndDelete(req.params.id);
  if (!candidate) {
    return next(new AppError('No candidate found with given ID', 404));
  }
  return res.status(204).json({
    status: 'Success',
  });
});
