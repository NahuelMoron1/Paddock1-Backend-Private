import { Router } from "express";
import {
  getActiveSocialworks,
  getAllSocialworks,
  getinActiveSocialworks,
  getSocialworkByAttendant,
  getSocialworkByAttendantModify,
  postSocialwork,
  SetActiveSocialwork,
  SetinActiveSocialwork,
} from "../controllers/Socialworks";

const router = Router();

router.get("/socialworks/active", getActiveSocialworks);
router.get("/socialworks/inactive", getinActiveSocialworks);
router.get("/socialworks/all", getAllSocialworks);
router.get("/set/active/:id", SetActiveSocialwork);
router.get("/set/inactive/:id", SetinActiveSocialwork);
router.get("/name/:attendantID", getSocialworkByAttendant);
router.get("/name/modify/:attendantID", getSocialworkByAttendantModify);
router.post("/", postSocialwork);
export default router;
