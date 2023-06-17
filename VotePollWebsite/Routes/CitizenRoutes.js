const citizenController = require('../Controller/citizenController');
const authController = require('../Controller/authController');

const express = require('express');
//Routers
const router = express.Router();
router.route('/create').post(citizenController.create)
router.route('/').get(citizenController.getAllCitizen)
router.route('/getCitizens').get(citizenController.getCitizens)
router.route('/:id').get(citizenController.getCitizen)
router.route('/election/:id').get(authController.isprotected, citizenController.getElections)
router.route('/generalCandidates/:id').get(authController.isprotected, citizenController.getGeneralCandidate)
router.route('/provisionalCandidates/:id').get(authController.isprotected, citizenController.getProvisionalCandidate)
router.route('/localCandidates/:id').get(authController.isprotected, citizenController.getLocalCandidate)

module.exports = router;