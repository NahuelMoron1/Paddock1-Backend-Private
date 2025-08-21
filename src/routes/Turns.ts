import { Router } from "express";
import {
  addCommentsAdmin,
  attendantCreateTurn,
  cancelTurn,
  completeTurn,
  createTurn,
  getAllAttendantTurns,
  getAllUserTurns,
  getAttendantTurnsByDate,
  getCanceledAdminTurns,
  getCanceledAttendantTurns,
  getCanceledUserTurns,
  getCompletedAdminTurns,
  getCompletedAttendantTurns,
  getCompletedUserTurns,
  getNotScheduledUserTurns,
  getScheduledAdminTurns,
  getScheduledAttendantTurns,
  getScheduledUserTurns,
} from "../controllers/Turns";

const router = Router();

//user
router.get("/user", getAllUserTurns);
router.get("/user/scheduled", getScheduledUserTurns);
router.get("/user/completed", getCompletedUserTurns);
router.get("/user/canceled", getCanceledUserTurns);
router.get("/user/notScheduled", getNotScheduledUserTurns);
router.post("/user/create", createTurn);

//attendant
router.get("/attendant", getAllAttendantTurns);
router.get("/attendant/scheduled", getScheduledAttendantTurns);
router.get("/attendant/completed", getCompletedAttendantTurns);
router.get("/attendant/canceled", getCanceledAttendantTurns);
router.get("/attendant/cancel/:id", cancelTurn);
router.get("/attendant/complete/:id", completeTurn);
router.post("/attendant/create", attendantCreateTurn);
router.post("/turns/comments/:turnID", addCommentsAdmin);
router.post("/turns/attendant/:attendantID", getAttendantTurnsByDate);

//admin
router.get("/admin/scheduled", getScheduledAdminTurns);
router.get("/admin/completed", getCompletedAdminTurns);
router.get("/admin/canceled", getCanceledAdminTurns);

export default router;
