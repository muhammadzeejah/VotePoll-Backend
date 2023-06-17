const authController = require('../Controller/authController');

const express = require('express');
//Routers
const router = express.Router();
router.route('/login').post(authController.login);
// if user is protected then log out
router.route('/logout').post(authController.isprotected, authController.logout)




module.exports = router;