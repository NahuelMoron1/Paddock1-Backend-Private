import { Router } from "express";
import {
  checkAttendantAvailability,
  deleteAttendantAvailability,
  getAttendantAvailability,
  modifyAttendantAvailability,
  postAttendantAvailability,
} from "../controllers/Availability";

const router = Router();

router.get("/:attendantID", getAttendantAvailability);
router.post("/", postAttendantAvailability);
router.post("/modify", modifyAttendantAvailability);
router.post("/check", checkAttendantAvailability);
router.delete("/:id", deleteAttendantAvailability);

export default router;
