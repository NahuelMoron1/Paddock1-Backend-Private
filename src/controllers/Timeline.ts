import { Request, Response } from "express";
import Timeline from "../models/mysql/TimeLine"; // tu modelo
import TimelineEvent from "../models/mysql/TimelineEvent"; // tu modelo
import { v4 as UUIDV4 } from "uuid";
import path from "path";
import fs from "fs";

export const getTimelines = async (req: Request, res: Response) => {
  try {
    const timelines = await Timeline.findAll();
    if (!timelines) {
      return res.status(404).json({ message: "No timelines found" });
    }

    return res.status(200).json(timelines);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error getting timelines" });
  }
};

export const getTimelineById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const timeline = await Timeline.findByPk(id);
    if (!timeline) {
      return res.status(404).json({ message: "Timeline not found" });
    }
    const events = await TimelineEvent.findAll({ where: { gameID: id } });
    if (!events) {
      return res.status(404).json({ message: "Events not found" });
    }
    return res.status(200).json({ timeline, events });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error getting timeline" });
  }
};

export const createTimeline = async (req: Request, res: Response) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const newTimeline = await Timeline.create({ date });

    return res.status(201).json({
      message: "Timeline created successfully",
      timeline: newTimeline,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creating timeline" });
  }
};

export const addTimelineEvent = async (req: Request, res: Response) => {
  try {
    const { timelineId, description, eventDate } = req.body;
    const file = req.file;

    if (!timelineId || !description || !file || !eventDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const timeline = await Timeline.findByPk(timelineId);
    if (!timeline) {
      return res.status(404).json({ message: "Timeline not found" });
    }

    const image = postImage(file, file.originalname, timelineId);

    if (!image) {
      return res.status(400).json({ message: "Error creating event" });
    }

    const newEvent = await TimelineEvent.create({
      description,
      image,
      eventDate,
      gameID: timelineId,
    });

    return res.status(201).json(newEvent);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creating event" });
  }
};

export const updateTimeline = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date } = req.body;

    const timeline = await Timeline.findByPk(id);
    if (!timeline) {
      return res.status(404).json({ message: "Timeline not found" });
    }

    await timeline.update({ date });

    return res.status(200).json({ timeline });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating timeline" });
  }
};

export const deleteTimelineEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    const event = await TimelineEvent.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    await event.destroy();

    return res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error deleting event" });
  }
};

export const postImage = (
  file: Express.Multer.File | Buffer,
  originalName?: string,
  timelineId?: string,
): string | undefined => {
  if (!file || !timelineId) return undefined;
  const uniqueName = `${UUIDV4()}${path.extname(originalName || "image.png")}`;
  const dirPath = path.join("uploads", "timeline", timelineId);
  const uploadPath = path.join(dirPath, uniqueName);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  if (file instanceof Buffer) {
    fs.writeFileSync(uploadPath, file as unknown as Uint8Array);
  } else {
    fs.writeFileSync(uploadPath, file.buffer as unknown as Uint8Array);
  }
  return uploadPath;
};
