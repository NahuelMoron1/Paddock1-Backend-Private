import { Router } from "express";
import {
  addTimelineEvent,
  createTimeline,
  deleteTimelineEvent,
  getTimelineById,
  getTimelines,
  updateTimeline,
} from "../controllers/Timeline";
import upload from "../middlewares/multer";

const router = Router();

router.get("/", getTimelines);
router.post("/", createTimeline);
router.post("/event", upload.single("file"), addTimelineEvent);
router.get("/:id", getTimelineById);
router.patch("/:id", updateTimeline);
router.delete("/event/:eventId", deleteTimelineEvent);

export default router;
