//WebsiteRoutes
const AuthRoutes = require('./VotePollWebsite/Routes/AuthRoutes');
const CitizenRoutes = require('./VotePollWebsite/Routes/CitizenRoutes');
const VoterRoutes = require('./VotePollWebsite/Routes/VoterRoutes');
const MailRoutes = require('./VotePollWebsite/Routes/ContactUsRoutes');

//AdminPanel Routes
const UserRoutes = require('./VotePollAdminPanel/Routes/UsersRoutes');
const PartiesRoutes = require('./VotePollAdminPanel/Routes/PartyRoutes');
const ConsituencyRoutes = require('./VotePollAdminPanel/Routes/consituencyRoutes');
const CandidateRoutes = require('./VotePollAdminPanel/Routes/candidateRoutes');
const ElectionRoutes = require('./VotePollAdminPanel/Routes/electionRoutes');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express('dev');
const path = require('path');
const bodyParser = require('body-parser');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./VotePollWebsite/Controller/errorController');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// MIDDLEWARE
app.use(express.json());
if (process.env.NODE_ENV === 'development') app.use(morgan());
app.use('/images/admin', express.static(path.join(__dirname, '.', 'VotePollAdminPanel', 'assets')))
app.use('/images/web', express.static(path.join(__dirname, '.', 'VotePollWebsite', 'assets')))
app.use(express.static('./public'));

//Mounting those routes
app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1/citizen', CitizenRoutes);
app.use('/api/v1/voterStatus', VoterRoutes);
app.use('/api/v1/send', MailRoutes);

app.use('/api/v1/users', UserRoutes);
app.use('/api/v1/parties', PartiesRoutes);
app.use('/api/v1/consituencies', ConsituencyRoutes);
app.use('/api/v1/consituencies', ConsituencyRoutes);
app.use('/api/v1/candidate', CandidateRoutes);
app.use('/api/v1/elections', ElectionRoutes);


//Wrong route err
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
