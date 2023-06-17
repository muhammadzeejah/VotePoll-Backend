const Controller = require('../Controller/electionController');
const userController = require('../Controller/userController');
const express = require('express');

//Routers
const router = express.Router();
router.route('/').get(userController.isprotected, Controller.getAllElections)
router.route('/election/:id').get(userController.isprotected, Controller.getElection)
router.route('/create').post(userController.isprotected, Controller.create)
router.route('/update/:id').patch(userController.isprotected, Controller.update)
router.route('/delete/:id').delete(userController.isprotected, Controller.delete)


module.exports = router;