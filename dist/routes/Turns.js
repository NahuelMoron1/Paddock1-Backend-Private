"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Turns_1 = require("../controllers/Turns");
const router = (0, express_1.Router)();
//user
router.get("/user", Turns_1.getAllUserTurns);
router.get("/user/scheduled", Turns_1.getScheduledUserTurns);
router.get("/user/completed", Turns_1.getCompletedUserTurns);
router.get("/user/canceled", Turns_1.getCanceledUserTurns);
router.get("/user/notScheduled", Turns_1.getNotScheduledUserTurns);
router.post("/user/create", Turns_1.createTurn);
//attendant
router.get("/attendant", Turns_1.getAllAttendantTurns);
router.get("/attendant/scheduled", Turns_1.getScheduledAttendantTurns);
router.get("/attendant/completed", Turns_1.getCompletedAttendantTurns);
router.get("/attendant/canceled", Turns_1.getCanceledAttendantTurns);
router.get("/attendant/cancel/:id", Turns_1.cancelTurn);
router.get("/attendant/complete/:id", Turns_1.completeTurn);
router.post("/attendant/create", Turns_1.attendantCreateTurn);
router.post("/turns/comments/:turnID", Turns_1.addCommentsAdmin);
router.post("/turns/attendant/:attendantID", Turns_1.getAttendantTurnsByDate);
//admin
router.get("/admin/scheduled", Turns_1.getScheduledAdminTurns);
router.get("/admin/completed", Turns_1.getCompletedAdminTurns);
router.get("/admin/canceled", Turns_1.getCanceledAdminTurns);
exports.default = router;
