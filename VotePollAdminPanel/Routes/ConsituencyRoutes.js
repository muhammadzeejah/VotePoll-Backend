const Controller = require('../Controller/consituencyController');
const userController = require('../Controller/userController');
const express = require('express');

//Routers
const router = express.Router();
router.route('/').get(userController.isprotected, Controller.getAllConsituencies)
router.route('/getUC').get(userController.isprotected, Controller.getAllUCs)

router.route('/consituency/:id').get(userController.isprotected, Controller.getConsituency)
router.route('/create').post(userController.isprotected, Controller.create)
router.route('/update/:id').patch(userController.isprotected, Controller.update)
router.route('/delete/:id').delete(userController.isprotected, Controller.delete)


module.exports = router;