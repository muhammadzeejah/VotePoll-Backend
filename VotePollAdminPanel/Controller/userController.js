const { promisify } = require('util')
const AppError = require('../../utils/appError');
const citizenModel = require('./../../VotePollWebsite/Models/citizens');
const secretToken = require('./../Models/secretTokens');
const validator = require('email-validator');
const User = require('./../Models/user')
const catchAsync = require('../../utils/catchAsync');
const sendEmail = require('../../utils/email');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const { cnic, ecpSecretKey, userName, password, passwordConfirm } = req.body;
    if (!cnic || !ecpSecretKey || !userName || !password || !passwordConfirm) {
        return next(new AppError('Please enter all the required fields to register a User', 400)
        );
    }
    const tokenInfo = await secretToken.findOne({ cnic }).select('+token');
    if (tokenInfo) {
        const tokenExist = await tokenInfo.correctToken(ecpSecretKey, tokenInfo.token);
        if (!tokenExist) {
            return next(new AppError('Wrong token', 400));
        }
    } else {
        return next(new AppError('No token existed for the given cnic', 400));
    }

    const citizen = await citizenModel.exists({ cnic });
    if (!citizen) {
        return next(new AppError('Invalid cnic, Citizen not existed in database', 400));
    }
    if (password.length < 8) {
        return next(new AppError('Password must contain 8 characters', 400));
    }
    const userExist = await User.exists({ cnic });
    if (userExist) {
        return next(new AppError('User with the given cnic already exist', 400));
    }
    const user = { cnic, userName, password, passwordConfirm }
    const newUser = await User.create(user);
    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { userName, cnic, password } = req.body;

    // 1) Check if email and password exist
    if (!userName || !cnic || !password) {
        return next(new AppError('Please provide userName, cnic and password!', 400));
    }
    // 2) Check if user exists && password is correct
    const user = await User.findOne({ cnic, userName }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect user credentials', 401));
    }

    // 3) If everything ok, send token to client
    createSendToken(user, 200, res);
});

exports.generateSecretToken = async (req, res, next) => {
    const { cnic, token } = req.body;
    if (!cnic || !token) {
        return next(new AppError('Please provide Cnic and Token!', 400));
    }
    const citizen = await secretToken.exists({ cnic });
    if (citizen) {
        return next(new AppError('Already registered', 400));
    }
    const Token = await secretToken.create({ cnic, token });
    return res.status(200).json({
        status: 'Success',
        Token: Token
    });
}

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'success' });
}

exports.forgetPassword = catchAsync(async (req, res, next) => {
    const { cnic, token, email } = req.body;
    if (!cnic || !token || !email) {
        return next(new AppError('Please provide Cnic, email and Token!', 400));
    }
    if (!validator.validate(email)) {
        return next(new AppError('Please provide a valid email!', 400));
    }
    // 1) Get user based on POSTed email
    const user = await User.findOne({ cnic });
    if (!user) {
        return next(new AppError('There is no user with this cnic.', 404));
    }

    const tokenInfo = await secretToken.findOne({ cnic }).select('+token');
    if (tokenInfo) {
        const tokenExist = await tokenInfo.correctToken(token, tokenInfo.token);
        if (!tokenExist) {
            return next(new AppError('Wrong token', 400));
        }
    } else {
        return next(new AppError('No token existed for the given cnic', 400));
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
    try {
        await sendEmail({
            email: email,
            subject: 'VotePoll - Your password reset token (valid for 10 min)',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError('There was an error sending the email. Try again later!'),
            500
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.status(200).json({
        status: 'success',
        message: 'Password successfully updated!'
    });
});

exports.isprotected = catchAsync(async (req, res, next) => {
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
    next();
})