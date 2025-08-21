import { Router } from "express";
import {
  deleteAttendantReview,
  getAttendantReviews,
  getUserReview,
  getUserReviews,
  modifyReview,
  setAttendantReview,
} from "../controllers/Reviews";

const router = Router();

router.get("/:attendantID", getAttendantReviews);
router.get("/user/:userID", getUserReviews);
router.get("/user/attendant/:attendantID/:userID", getUserReview);
router.post("/", setAttendantReview);
router.post("/modify", modifyReview);
router.delete("/:id", deleteAttendantReview);

export default router;
