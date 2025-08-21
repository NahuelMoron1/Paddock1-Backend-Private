import { Router } from "express";
import upload from "../middlewares/multer";
import {
  getActiveSocialworks,
  getAllSocialworks,
  getinActiveSocialworks,
  getSocialworkByAttendant,
  SetActiveSocialwork,
  SetinActiveSocialwork,
} from "../controllers/Socialworks";

const router = Router();

router.get("/socialworks/active", getActiveSocialworks);
router.get("/socialworks/inactive", getinActiveSocialworks);
router.get("/socialworks/all", getAllSocialworks);
router.get("/set/active/:id", SetActiveSocialwork);
router.get("/set/inactive/:id", SetinActiveSocialwork);
router.get("/name/:name", getSocialworkByAttendant);
///router.post("/", upload.single("file"), postSocialwork); /// TO DO
export default router;
