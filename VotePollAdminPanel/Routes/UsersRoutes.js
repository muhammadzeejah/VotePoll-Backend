const userController = require('./../Controller/userController');
const express = require('express');

//Routers
const router = express.Router();
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.post('/token', userController.generateSecretToken);
router.post('/logout', userController.logout);
router.post('/forgetPassword', userController.forgetPassword);
router.patch('/resetPassword/:token', userController.resetPassword);

module.exports = router;