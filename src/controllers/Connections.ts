import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import Connections from "../models/mysql/Connections";
import Connections_Groups from "../models/mysql/Connections_Groups";
import Connections_Groups_Results from "../models/mysql/Connections_Groups_Results";
import { Drivers, Teams, Tracks } from "../models/mysql/associations";

export const getAllConnections = async (req: Request, res: Response) => {
  try {
    const allConnections = await Connections.findAll();
    if (!allConnections) {
      return res.status(404).json({ message: "No connections found" });
    }

    return res.status(200).json(allConnections);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getGameByID = async (req: Request, res: Response) => {
  try {
    const { gameID } = req.params;
    if (!gameID) {
      return res.status(400).json({ message: "No ID Provided" });
    }

    const connectionGame = await Connections.findByPk(gameID);
    if (!connectionGame) {
      return res.status(404).json({ message: "No connection game found" });
    }

    return res.status(200).json(connectionGame);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getGroupsByGameID = async (req: Request, res: Response) => {
  try {
    const { gameID } = req.params;
    if (!gameID) {
      return res.status(400).json({ message: "No ID Provided" });
    }

    const groups = await Connections_Groups.findAll({
      where: { gameID: gameID },
    });

    if (!groups) {
      return res.status(404).json({ message: "No group found" });
    }

    return res.status(200).json(groups);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getResultsByGroupID = async (req: Request, res: Response) => {
  try {
    const { groupID, type } = req.params;
    if (!groupID) {
      return res.status(400).json({ message: "No ID Provided" });
    }

    const groupResults = await Connections_Groups_Results.findAll({
      where: { groupID: groupID },
    });

    if (!groupResults) {
      return res.status(404).json({ message: "No results found" });
    }

    const resultIDs = groupResults.map((gr) => gr.getDataValue("resultID"));

    let results: any[] = [];

    if (type === "driver") {
      results = await Drivers.findAll({ where: { id: resultIDs } });
      return res.status(200).json({ driver: results, groupID });
    } else if (type === "team") {
      results = await Teams.findAll({ where: { id: resultIDs } });
      return res.status(200).json({ team: results, groupID });
    } else if (type === "track") {
      results = await Tracks.findAll({ where: { id: resultIDs } });
      return res.status(200).json({ track: results, groupID });
    } else {
      return res.status(400).json({ message: "Invalid type" });
    }
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const createGame = async (req: Request, res: Response) => {
  try {
    const game = req.body;

    if (!game || !game.date || !game.type || !game.amount_groups) {
      return res
        .status(400)
        .json({ message: "Not all fields contains a value" });
    }

    const date = game.date;
    const type = game.type;
    const amount_groups = game.amount_groups;

    if (
      typeof date !== "string" ||
      typeof type !== "string" ||
      typeof amount_groups !== "number"
    ) {
      return res.status(400).json({
        message:
          "There's a mistake on your try to create the game, please check every information you wrote.",
      });
    }
    const gameID = uuidv4();

    const newGame = {
      id: gameID,
      date: date,
      type: type,
      amount_groups: amount_groups,
    };

    const created = await Connections.create(newGame);

    if (!created) {
      return res.status(304).json({
        message:
          "Something failed while creating connections game. Please contact support",
      });
    }

    return res.status(200).json(gameID);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const createGroup = async (req: Request, res: Response) => {
  try {
    const group = req.body;

    if (!group || !group.title || !group.gameID || !group.results) {
      return res
        .status(400)
        .json({ message: "Not all fields contains a value" });
    }

    const title = group.title;
    const gameID = group.gameID;
    const results = group.results;

    if (
      typeof title !== "string" ||
      typeof gameID !== "string" ||
      typeof results !== "number"
    ) {
      return res.status(400).json({
        message:
          "There's a mistake on your try to create a group for game connections, please check every information you wrote.",
      });
    }

    const id = uuidv4();

    const newGroup = {
      id: id,
      title: title,
      gameID: gameID,
      results: results,
    };

    const groupCreated = await Connections_Groups.create(newGroup);

    return res.status(200).json(groupCreated);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const createResults = async (req: Request, res: Response) => {
  try {
    const results = req.body;

    if (!results || !results.gameID || !results.groupID || !results.resultID) {
      return res
        .status(400)
        .json({ message: "Not all fields contains a value" });
    }

    const groupID = results.groupID;
    const resultID = results.resultID;
    const gameID = results.gameID;

    if (
      typeof gameID !== "string" ||
      typeof groupID !== "string" ||
      typeof resultID !== "string"
    ) {
      return res.status(400).json({
        message:
          "There's a mistake on your try to create a group for game connections, please check every information you wrote.",
      });
    }

    const id = uuidv4();
    const newResult = {
      id: id,
      gameID: gameID,
      groupID: groupID,
      resultID: resultID,
    };

    const created = await Connections_Groups_Results.create(newResult);

    if (!created) {
      return res.status(304).json({
        message:
          "Something failed while creating connections results in game. Please contact support",
      });
    }

    return res.status(200).json(true);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};
