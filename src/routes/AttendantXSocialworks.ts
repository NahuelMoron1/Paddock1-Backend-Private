import { Router } from "express";
import {
  deleteAttendantXSocialwork,
  postAttendantXSocialwork,
} from "../controllers/AttendantXSocialworks";

const router = Router();

router.post("/", postAttendantXSocialwork);
router.delete("/delete/:attendantID/:socialworkID", deleteAttendantXSocialwork);

export default router;
