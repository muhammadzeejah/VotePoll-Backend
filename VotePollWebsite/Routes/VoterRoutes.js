const authController = require('../Controller/authController');
const voterController = require('../Controller/voterController');
const express = require('express');
//Routers
const router = express.Router();
router.route('/:id').get(authController.isprotected, voterController.getVoterStatus)
router.route('/update/:id').patch(authController.isprotected, voterController.update)




module.exports = router;