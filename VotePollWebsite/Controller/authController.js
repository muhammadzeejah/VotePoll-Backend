const { promisify } = require('util')
const AppError = require('../../utils/appError');
const citizenModel = require('../Models/citizens');
const voterModel = require('../Models/voter');
const catchAsync = require('../../utils/catchAsync');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const addToVoterList = catchAsync(async (cnic) => {
    const voterExist = await voterModel.findOne({cnic: cnic});
    if(!voterExist) {
        const citizen = await citizenModel.findOne({cnic: cnic});
        if (!citizen) {
            return next(new AppError('No citizen found against this id', 404));
        }
        const electionAppearence = {
            generalElections: false,
            provincialElections: false,
            localBodyElections: false
        };
        const citizenInfo = {cnic: citizen.cnic, electionAppearence: electionAppearence};
       await voterModel.create(citizenInfo);
    }
});

exports.login = catchAsync(async (req, res, next) => {
    const { cnic } = req.body;
    // Incase of no cnic sent
    if (!cnic) {
        return next(new AppError('Please enter cnic ', 400));
    }
    let citizen;
    //Check if the citizen exists
    citizen = await voterModel.findOne({ cnic: cnic });

    if (!citizen) {
        //Check if the citizen exists
        citizen = await citizenModel.findOne({ cnic: cnic });
        //To indentify what is wrong whether cnic or fingrprint
        // we check first if the user is found and is the user is found means that the cnic is right
        if (!citizen) {
            return next(new AppError('Incorrect CNIC', 401));
        }
        if (citizen) {
            addToVoterList(cnic);
        }
    }
    //If everything ok send token
    const token = signToken(citizen._id);
    if (process.env.NODE_ENV === 'production') {
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60 * 1000),
            secure: true,
            httpOnly: true
        })
    } else {
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60 * 1000),
            httpOnly: true
        })
    }

    return res.status(200).json({
        status: 'Success',
        TOKEN: token
    });
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedOut', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })
    return res.status(200).json({
        status: 'Success',
    });
}

exports.isprotected = catchAsync(async (req, res, next) => {
    // Getting token and check if it's there
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(
            new AppError('You are not logged in! Please log in to get access.', 401)
        );
    }
    //Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    //Check if the user extist in voter DB so that we block the voting route for user...
    // we will find user by his obj id (decoded.id)
    next();
})