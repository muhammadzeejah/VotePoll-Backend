/* The above code is a module that exports several functions to handle HTTP requests related to
parties. */
const Parties = require('./../Models/parties');
const Candidate = require('./../Models/candidate');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const APIFeatures = require('../../utils/apiFeatures');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = require('./../../app');
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${__dirname}/../assets/Party`);
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `party-${new Date().toISOString().replace(/:/g, '-')}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
//Middleware for logo upload
exports.uploadPartyLogo = upload.fields([
  { name: 'logo' },
  { name: 'leaderPicture' },
]);

/* This code exports a function named `getAllParties` which is used as a middleware to handle HTTP GET
requests to retrieve all parties. */
exports.getAllParties = catchAsync(async (req, res, next) => {
  let page = 1;
  let limit = 10;
  let count;

  if (isNaN(req.query.page) || isNaN(req.query.limit)) {
    return next(new AppError('Please enter a valid page and limit', 400));
  }
  const features = await new APIFeatures(Parties.find(), req.query).paginate();
  if (features.queryString.page) {
    page = features.queryString.page;
    limit = features.queryString.limit;
    const skip = (page - 1) * limit;
    count = await Parties.countDocuments();
    if (skip >= count) {
      return next(new AppError('This page doesnot exist', 400));
    }
  }
  const parties = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    limit: limit,
    total: count,
    page: page,
    data: {
      parties,
    },
  });
});

exports.getParty = catchAsync(async (req, res, next) => {
  const party = await Parties.findById(req.params.id);
  if (!party) {
    return next(new AppError('No party found with that ID', 404));
  }
  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    data: {
      party,
    },
  });
});

exports.create = catchAsync(async (req, res, next) => {
  const { name, leader, president, manifesto, description, postalAddress } =
    req.body;
  let logo = null;
  let leaderPicture = null;
  if (req.files) {
    if (req.files.logo && req.files.leaderPicture) {
      logo = req.files.logo[0].filename;
      leaderPicture = req.files.leaderPicture[0].filename;
    }
  }
  if (
    !logo ||
    !leaderPicture ||
    !name ||
    !leader ||
    !president ||
    !manifesto ||
    !description ||
    !postalAddress
  ) {
    return next(
      new AppError(
        'Please enter all the required fields to register a party',
        400
      )
    );
  }
  const query = {
    $or: [
      { logo: logo },
      { name: name },
      { leader: leader },
      { leaderPicture: leaderPicture },
      { president: president },
    ],
  };
  const user = await Parties.findOne(query);
  if (user) {
    return next(
      new AppError(
        'Party already existed with similar details, Please enter diffrent details',
        400
      )
    );
  }

  const party = await Parties.create({
    logo: logo,
    name: name,
    leader: leader,
    leaderPicture: leaderPicture,
    president: president,
    manifesto: manifesto,
    description: description,
    postalAddress: postalAddress,
  });
  return res.status(201).json({
    status: 'Success',
    party,
  });
});

exports.update = catchAsync(async (req, res, next) => {
  const { name, leader, president, manifesto, description, postalAddress } =
    req.body;
  let logo = null;
  let leaderPicture = null;
  if (req.files) {
    if (req.files.logo && req.files.leaderPicture) {
      logo = req.files.logo[0].filename;
      leaderPicture = req.files.leaderPicture[0].filename;
    }
  } else if (req.body.logo && req.body.leaderPicture) {
    logo = req.body.logo;
    leaderPicture = req.body.leaderPicture;
  }
  if (
    !logo ||
    !leaderPicture ||
    !name ||
    !leader ||
    !president ||
    !manifesto ||
    !description ||
    !postalAddress
  ) {
    return next(
      new AppError(
        'Please enter all the required fields to register a party',
        400
      )
    );
  }

  const party = await Parties.findById(req.params.id);
  if (!party) {
    return next(new AppError('No party found with that ID', 404));
  }
  if (req.files) {
    if (req.files.logo && req.files.leaderPicture) {
    app.use(uploadPartyLogo);
   fs.unlinkSync(path.join(__dirname, '..', 'assets', 'Party', party.logo));
   fs.unlinkSync(path.join(__dirname, '..', 'assets', 'Party', party.leaderPicture));
  }} else if (req.body.logo && req.body.leaderPicture) {
      const isLogo =  fs.existsSync(path.join(__dirname, '..', 'assets', 'Party', req.body.logo))
      const isLeader =  fs.existsSync(path.join(__dirname, '..', 'assets', 'Party', req.body.leaderPicture))
      // if(!isLogo || !isLeader) {
      // return next(new AppError('Image not found', 400));
      // }
  }
  const newParty = await Parties.findByIdAndUpdate(
    req.params.id,
    {
      logo: logo,
      name: name,
      leader: leader,
      leaderPicture: leaderPicture,
      president: president,
      manifesto: manifesto,
      description: description,
      postalAddress: postalAddress,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!newParty) {
    return next(new AppError('No party found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      party,
    },
  });
});

exports.delete = catchAsync(async (req, res, next) => {
  if (!req.params.id) {
    return next(
      new AppError('Specify ID of the party you want to delete', 400)
    );
  }
  const party = await Parties.findById(req.params.id);
  const candidates = await Candidate.find({'party.name': party.name })
  candidates.forEach(async candidate => {
    await Candidate.findByIdAndDelete(candidate);
  });
  await fs.unlinkSync(path.join(__dirname, '..', 'assets', 'Party', party.logo));
  await fs.unlinkSync(
    path.join(__dirname, '..', 'assets', 'Party', party.leaderPicture)
    );
  const partydel = await Parties.findByIdAndDelete(req.params.id);
  if (!partydel) {
    return next(new AppError('No party found with given ID', 404));
  }
  return res.status(204).json({
    status: 'Success',
  });
});
