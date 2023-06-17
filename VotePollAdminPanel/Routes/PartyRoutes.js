const Controller = require('../Controller/partyController');
const userController = require('../Controller/userController');
const express = require('express');

//Routers
const router = express.Router();
router.route('/').get(userController.isprotected, Controller.getAllParties)
router.route('/party/:id').get(userController.isprotected, Controller.getParty)
router.route('/create').post(userController.isprotected, Controller.uploadPartyLogo,Controller.create)
router.route('/update/:id').patch(userController.isprotected,Controller.update)
router.route('/delete/:id').delete(userController.isprotected, Controller.delete)


module.exports = router;