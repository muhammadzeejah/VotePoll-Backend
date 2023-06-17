const Controller = require('../Controller/candidateController');
const userController = require('../Controller/userController');
const express = require('express');

//Routers
const router = express.Router();
router.route('/').get(userController.isprotected, Controller.getAllCandidates)
router.route('/getCandidates').get(userController.isprotected, Controller.getCandidates)
router.route('/:id').get(userController.isprotected, Controller.getCandidate)
router.route('/create').post(userController.isprotected, Controller.create)
router.route('/update/:id').patch(userController.isprotected, Controller.update)
router.route('/delete/:id').delete(userController.isprotected, Controller.delete)


module.exports = router;