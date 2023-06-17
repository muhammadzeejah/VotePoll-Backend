const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const tokenSchema = new mongoose.Schema({
    cnic: {
        type: String,
        required: [true, 'The cnic is required'],
    },
    token: {
        type: String,
        required: [true, 'The cnic is required'],
        minlength: 8,
        select: false,
    }
});

tokenSchema.pre('save', async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified('token')) return next();
    this.token = await bcrypt.hash(this.token, 12);
    next();
});

tokenSchema.methods.correctToken = async function (
    candidateToken,
    userToken
) {
    return await bcrypt.compare(candidateToken, userToken);
};

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
