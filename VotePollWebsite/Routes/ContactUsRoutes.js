const Controller = require('../Controller/ContactUsController');
const express = require('express');
//Routers
const router = express.Router();
router.route('/contact-us').post(Controller.contactUs)


module.exports = router;