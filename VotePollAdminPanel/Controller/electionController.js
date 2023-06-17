const Election = require('./../Models/elections');
const Consituency = require('./../Models/consituencies');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const APIFeatures = require('../../utils/apiFeatures');
const dayjs = require('dayjs');

exports.getAllElections = catchAsync(async (req, res, next) => {
    let page = 1;
    let limit = 10;
    let count;

    if (isNaN(req.query.page) || isNaN(req.query.limit)) {
        return next(new AppError('Please enter a valid page and limit', 400));
    }
    const features = await new APIFeatures(Election.find(), req.query).paginate();
    if (features.queryString.page) {
        page = features.queryString.page;
        limit = features.queryString.limit;
        const skip = (page - 1) * limit;
        count = await Election.countDocuments();
        if (skip >= count) {
            return next(new AppError('This page doesnot exist', 400));
        }
    }
    const election = await features.query;

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        limit: limit,
        total: count,
        page: page,
        data: {
            election,
        },
    });
});

exports.getElection = catchAsync(async (req, res, next) => {
    const election = await Election.findById(req.params.id);
    if (!election) {
        return next(new AppError('No election found with that ID', 404));
    }
    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        data: {
            election,
        },
    });
});

exports.create = catchAsync(async (req, res, next) => {
    const { type, status, start, end, area } = req.body;
    if (!type || !status || !start || !end) {
        return next(new AppError('Please enter all the required fields to register a election', 400));
    }

    if (type !== 'LOCAL' && type !== 'PROVINCIAL' && type !== 'NATIONAL') {
        return next(new AppError('Please enter valid election type', 400));
    }
    if (type === 'LOCAL' && type === 'PROVINCIAL') {
        if (area.length <= 0) return next(new AppError('Please enter a valid area', 400));
    }
    if (type === 'NATIONAL' && area) return next(new AppError('area field is not required in case of general elections', 400));

    if (status !== 'OPEN' && status !== 'CLOSED' && status !== 'PENDING') {
        return next(new AppError('Please enter valid election status', 400));
    }
    const nowDate = new Date().getTime() / 1000;
    if (start < nowDate) return next(new AppError(`${start} is before ${nowDate}`, 400));
    if (end < start) return next(new AppError(`${end} is before ${start}`, 400));
    if (type === 'PROVINCIAL') {
        for (let i = 0; i < area.length; i++) {
            if (area[i] !== 'Sindh' && area[i] !== 'Punjab' && area[i] !== 'Pakhtoon Khuwah' && area[i] !== 'Balouchistan') return next(new AppError(`Invalid area ${area[i]}`, 400));
        }
    } else if (type === 'LOCAL') {
        for (let i = 0; i < area.length; i++) {
            const consituency = await Consituency.findOne({ halka: area[i] });
            if (!consituency) {
                return next(new AppError(`Invalid area ${area[i]}`, 400));
            }
        }
    }
    if(type === 'PROVINCIAL' || type === 'LOCAL') {
        let duplicate= '';
        for (let i = 0; i < area.length; i++) {
            const election = await Election.findOne({ area: { $all: [area[i]] } });
            if (election) {
                if (election.status === 'OPEN') {
                    duplicate = area
                    break;  
                }
            }
          }
        if(duplicate) {
            return next(new AppError(`Election for ${duplicate} is already opened`, 400));
        }
    } else if (type === 'NATIONAL') {
        const election = await Election.findOne({ type:'NATIONAL' });
        if (election) {
            if (election.status === 'OPEN') {
                return next(new AppError(`General Elections are already opened`, 400)); 
            }
        }
      }
    
    const startTime = dayjs.unix(start);
    const endTime = dayjs.unix(end);
    const newElection = await Election.create({
        type: type,
        status: status,
        startTime: startTime,
        endTime: endTime,
        area: area,
    });
    return res.status(201).json({
        status: 'Success',
        newElection,
    });
});

exports.update = catchAsync(async (req, res, next) => {
    const { type, status, start, end, area } = req.body;
    if (!type || !status || !start || !end) {
        return next(new AppError('Please enter all the required fields to register a election', 400));
    }

    if (type !== 'LOCAL' && type !== 'PROVINCIAL' && type !== 'NATIONAL') {
        return next(new AppError('Please enter valid election type', 400));
    }
    if (type === 'LOCAL' && type === 'PROVINCIAL') {
        if (area.length <= 0) return next(new AppError('Please enter a valid area', 400));
    }
    if (type === 'NATIONAL' && area) return next(new AppError('area field is not required in case of general elections', 400));

    if (status !== 'OPEN' && status !== 'CLOSED' && status !== 'PENDING') {
        return next(new AppError('Please enter valid election status', 400));
    }
    const nowDate = new Date().getTime() / 1000;
    if (start < nowDate) return next(new AppError(`${start} is before ${nowDate}`, 400));
    if (end < start) return next(new AppError(`${end} is before ${start}`, 400));
    if (type === 'PROVINCIAL') {
        for (let i = 0; i < area.length; i++) {
            if (area[i] !== 'Sindh' && area[i] !== 'Punjab' && area[i] !== 'Pakhtoon Khuwah' && area[i] !== 'Balouchistan') return next(new AppError(`Invalid area ${area[i]}`, 400));
        }
    } else if (type === 'LOCAL') {
        for (let i = 0; i < area.length; i++) {
            const consituency = await Consituency.findOne({ halka: area[i] });
            if (!consituency) {
                return next(new AppError(`Invalid area ${area[i]}`, 400));
            }
        }
    }
    const startTime = dayjs.unix(start);
    const endTime = dayjs.unix(end);
    const newElection = await Election.findByIdAndUpdate(
        req.params.id,
        {
            type: type,
            status: status,
            startTime: startTime,
            endTime: endTime,
            area: area,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!newElection) {
        return next(new AppError('No election found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            newElection,
        },
    });
});

exports.delete = catchAsync(async (req, res, next) => {
    if (!req.params.id) {
        return next(
            new AppError('Specify ID of the election you want to delete', 400)
        );
    }

    const election = await Election.findByIdAndDelete(req.params.id);
    if (!election) {
        return next(new AppError('No election found with given ID', 404));
    }
    return res.status(204).json({
        status: 'Success',
    });
});
