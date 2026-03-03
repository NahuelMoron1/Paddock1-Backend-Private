"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postImage = exports.deleteTimelineEvent = exports.updateTimeline = exports.addTimelineEvent = exports.createTimeline = exports.getTimelineById = exports.getTimelines = void 0;
const TimeLine_1 = __importDefault(require("../models/mysql/TimeLine")); // tu modelo
const TimelineEvent_1 = __importDefault(require("../models/mysql/TimelineEvent")); // tu modelo
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const getTimelines = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const timelines = yield TimeLine_1.default.findAll();
        if (!timelines) {
            return res.status(404).json({ message: "No timelines found" });
        }
        return res.status(200).json(timelines);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error getting timelines" });
    }
});
exports.getTimelines = getTimelines;
const getTimelineById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const timeline = yield TimeLine_1.default.findByPk(id);
        if (!timeline) {
            return res.status(404).json({ message: "Timeline not found" });
        }
        const events = yield TimelineEvent_1.default.findAll({ where: { gameID: id } });
        if (!events) {
            return res.status(404).json({ message: "Events not found" });
        }
        return res.status(200).json({ timeline, events });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error getting timeline" });
    }
});
exports.getTimelineById = getTimelineById;
const createTimeline = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date } = req.body;
        if (!date) {
            return res.status(400).json({ message: "Date is required" });
        }
        const newTimeline = yield TimeLine_1.default.create({ date });
        return res.status(201).json({
            message: "Timeline created successfully",
            timeline: newTimeline,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error creating timeline" });
    }
});
exports.createTimeline = createTimeline;
const addTimelineEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { timelineId, description, eventDate } = req.body;
        const file = req.file;
        if (!timelineId || !description || !file || !eventDate) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const timeline = yield TimeLine_1.default.findByPk(timelineId);
        if (!timeline) {
            return res.status(404).json({ message: "Timeline not found" });
        }
        const image = (0, exports.postImage)(file, file.originalname, timelineId);
        if (!image) {
            return res.status(400).json({ message: "Error creating event" });
        }
        const newEvent = yield TimelineEvent_1.default.create({
            description,
            image,
            eventDate,
            gameID: timelineId,
        });
        return res.status(201).json(newEvent);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error creating event" });
    }
});
exports.addTimelineEvent = addTimelineEvent;
const updateTimeline = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { date } = req.body;
        const timeline = yield TimeLine_1.default.findByPk(id);
        if (!timeline) {
            return res.status(404).json({ message: "Timeline not found" });
        }
        yield timeline.update({ date });
        return res.status(200).json({ timeline });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error updating timeline" });
    }
});
exports.updateTimeline = updateTimeline;
const deleteTimelineEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventId } = req.params;
        const event = yield TimelineEvent_1.default.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        yield event.destroy();
        return res.status(200).json({ message: "Event deleted successfully" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error deleting event" });
    }
});
exports.deleteTimelineEvent = deleteTimelineEvent;
const postImage = (file, originalName, timelineId) => {
    if (!file || !timelineId)
        return undefined;
    const uniqueName = `${(0, uuid_1.v4)()}${path_1.default.extname(originalName || "image.png")}`;
    const dirPath = path_1.default.join("uploads", "timeline", timelineId);
    const uploadPath = path_1.default.join(dirPath, uniqueName);
    if (!fs_1.default.existsSync(dirPath)) {
        fs_1.default.mkdirSync(dirPath, { recursive: true });
    }
    if (file instanceof Buffer) {
        fs_1.default.writeFileSync(uploadPath, file);
    }
    else {
        fs_1.default.writeFileSync(uploadPath, file.buffer);
    }
    return uploadPath;
};
exports.postImage = postImage;
