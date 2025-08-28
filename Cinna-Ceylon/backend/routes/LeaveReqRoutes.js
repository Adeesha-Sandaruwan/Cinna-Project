const express = require('express');
const router = express.Router();
const LeaveReqController = require('../contollers/LeaveReqController');

router.post('/', LeaveReqController.createLeaveReq);
router.get('/', LeaveReqController.getAllLeaveReqs);
router.get('/:id', LeaveReqController.getLeaveReqById);
router.put('/:id', LeaveReqController.updateLeaveReq);
router.delete('/:id', LeaveReqController.deleteLeaveReq);

module.exports = router;
