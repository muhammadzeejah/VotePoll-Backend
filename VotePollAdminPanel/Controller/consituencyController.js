const Consituency = require('./../Models/consituencies');
const Candidate = require('./../Models/candidate');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const APIFeatures = require('../../utils/apiFeatures');

// consituencies
// consituency
exports.getAllConsituencies = catchAsync(async (req, res, next) => {
  let page = 1;
  let limit = 10;
  let count;
  if (isNaN(req.query.page) || isNaN(req.query.limit)) {
    return next(new AppError('Please enter a valid page and limit', 400));
  }
  const features = await new APIFeatures(Consituency.find(), req.query).paginate();
  if (features.queryString.page) {
    page = features.queryString.page;
    limit = features.queryString.limit;
    const skip = (page - 1) * limit;
    count = await Consituency.countDocuments();
    if (skip >= count) {
      return next(new AppError('This page doesnot exist', 400));
    }
  }
  const consituencies = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    limit: limit,
    page: page,
    total: count,
    data: {
      consituencies,
    },
  });
});

exports.getAllUCs = catchAsync(async (req, res, next) => {
  let Chairman, Councellor; 
  Chairman = await Consituency.find({ seatType: "Chairman"});
  Councellor = await Consituency.find({ seatType: "Councellor"});
  let consituency= Chairman.concat(Councellor);
  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    data: {
      consituency,
    },
  });
});


exports.getConsituency = catchAsync(async (req, res, next) => {
  const consituency = await Consituency.findById(req.params.id);
  if (!consituency) {
    return next(new AppError('No consituency found with that ID', 404));
  }
  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    data: {
      consituency,
    },
  });
});

exports.create = catchAsync(async (req, res, next) => {
  const { name, seatType, halka, province, division, unionCouncils } =
    req.body;
  if (
    !name || !seatType || !halka || !province || !division || !unionCouncils.length
  ) {
    return next(
      new AppError(
        'Please enter all the required fields to register a Consituency',
        400
      )
    );
  }
  for (let i = 0; i < unionCouncils.length; i++) {
    const consituency = await Consituency.find({ unionCouncils: { $all: [unionCouncils[i]] } });
    if (consituency.length) {
      for (let i = 0; i < consituency.length; i++) {
        if (consituency[i].seatType === seatType) {
          return next(
            new AppError(
              'UnionCouncil already existed in some other consituency',
              400
            )
          );
        }
      }
    }
  }
  const query = {
    $or: [
      { name: name },
      { halka: halka },
    ],
  };
  const consituency = await Consituency.find(query);
  if (consituency.length) {
    for (let i = 0; i < consituency.length; i++) {
      if (consituency[i].seatType === seatType) {
        return next(
          new AppError(
            'Consituency already existed with similar details, Please enter diffrent user name and halka',
            400
          )
        );
      }
    }
  }
  const newConsituency = await Consituency.create({
    name: name,
    seatType: seatType,
    halka: halka,
    province: province,
    division: division,
    unionCouncils: unionCouncils,
  });
  return res.status(201).json({
    status: 'Success',
    newConsituency,
  });
});

exports.update = catchAsync(async (req, res, next) => {
  const { name, seatType, halka, province, division, unionCouncils } =
    req.body;
  if (
    !name || !seatType || !halka || !province || !division || !unionCouncils.length
  ) {
    return next(
      new AppError(
        'Please enter all the required fields to register a Consituency',
        400
      )
    );
  }
  const consituency = await Consituency.findByIdAndUpdate(
    req.params.id,
    {
      name: name,
      seatType: seatType,
      halka: halka,
      province: province,
      division: division,
      unionCouncils: unionCouncils,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!consituency) {
    return next(new AppError('No consituency found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      consituency,
    },
  });
});

exports.delete = catchAsync(async (req, res, next) => {
  if (!req.params.id) {
    return next(
      new AppError('Specify ID of the consituency you want to delete', 400)
    );
  }
  const consituency = await Consituency.findById(req.params.id);
  if (!consituency) {
    return next(new AppError('No consituency found with given ID', 404));
  }
  const candidate = await Candidate.find({ 'consituencies.halka': consituency.halka });
  if (candidate.length > 0) {
    candidate.forEach(async candidate => {
      if (candidate.consituencies.length === 1) {
        await Candidate.findByIdAndDelete(candidate._id);
      } else if (candidate.consituencies.length > 1) {
        const party = candidate.party;
        const citizen = candidate.citizen;
        const consituencies = candidate.consituencies.filter(cons => cons.halka !== consituency.halka)
        const assets = candidate.assets;
        const updatedCandidate = { citizen, party, consituencies, assets };
        await Candidate.findByIdAndUpdate(
          candidate._id,
          updatedCandidate,
          {
            new: true,
            runValidators: true,
          }
        );
      }
    });
  }
  await Consituency.findByIdAndDelete(req.params.id);
  return res.status(204).json({
    status: 'Success',
  });
});
