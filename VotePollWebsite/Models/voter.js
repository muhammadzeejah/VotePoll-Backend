const mongoose = require('mongoose').set('debug', true);

const VotersSchema = new mongoose.Schema({
    cnic: {
        type: String,
        required: [true, 'The cnic is required'],
        unique: true,
      },
    electionAppearence:{
      generalElections: {
        type: Boolean,
        required: [true, 'The General Elections is required'],
      },
      provincialElections: {
        type: Boolean,
        required: [true, 'The provincial Elections is required'],
      },
      localBodyElections: {
        type: Boolean,
        required: [true, 'The local Body Elections is required'],
      }
    }
});

const voters = mongoose.model('voters', VotersSchema);
module.exports = voters;
