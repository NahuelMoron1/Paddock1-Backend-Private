"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Timeline_1 = require("../controllers/Timeline");
const multer_1 = __importDefault(require("../middlewares/multer"));
const router = (0, express_1.Router)();
router.get("/", Timeline_1.getTimelines);
router.post("/", Timeline_1.createTimeline);
router.post("/event", multer_1.default.single("file"), Timeline_1.addTimelineEvent);
router.get("/:id", Timeline_1.getTimelineById);
router.patch("/:id", Timeline_1.updateTimeline);
router.delete("/event/:eventId", Timeline_1.deleteTimelineEvent);
exports.default = router;
