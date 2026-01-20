import { Request, Response } from "express";
import { col, fn, literal, Op, Sequelize } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { Top10Creation } from "../models/enums/Top10Creation";
import { StatQueryOptions } from "../models/IStatQueryOptions";
import {
  Season_Teams,
  Season_Tracks,
  Tracks,
} from "../models/mysql/associations";
import Best_tens from "../models/mysql/Best_tens";
import Best_tens_results from "../models/mysql/Best_tens_results";
import Drivers from "../models/mysql/Drivers";
import Manual_Best_tens_results from "../models/mysql/Manual_Best_Tens_Results";
import Season_Teams_Drivers from "../models/mysql/Season_Teams_Drivers";
import Seasons from "../models/mysql/Seasons";
import Teams from "../models/mysql/Teams";
import { getUserLogged, isAdmin } from "./Users";

export const getSuggestions = async (req: Request, res: Response) => {
  const { type, input } = req.params;

  if (!input || !type) {
    return res.status(400).json({ message: "Missing input or type" });
  }

  const normalized = input.trim().toLowerCase();
  let results: any[] = [];

  console.log(type);

  try {
    switch (type) {
      case "driver":
        results = await Drivers.findAll({
          where: Sequelize.where(
            Sequelize.fn(
              "lower",
              Sequelize.fn(
                "concat",
                Sequelize.col("firstname"),
                " ",
                Sequelize.col("lastname")
              )
            ),
            {
              [Op.like]: `%${normalized}%`,
            }
          ),
        });
        break;

      case "team":
        results = await Teams.findAll({
          where: Sequelize.where(Sequelize.fn("lower", Sequelize.col("name")), {
            [Op.like]: `%${normalized}%`,
          }),
        });
        break;

      case "track":
        results = await Tracks.findAll({
          where: Sequelize.where(
            Sequelize.fn("lower", Sequelize.col("track_name")),
            {
              [Op.like]: `%${normalized}%`,
            }
          ),
        });
        break;
      case "season":
        results = await Seasons.findAll({
          where: Sequelize.where(Sequelize.fn("lower", Sequelize.col("year")), {
            [Op.like]: `%${normalized}%`,
          }),
        });

        break;

      default:
        return res.status(400).json({ message: "Invalid type" });
    }

    const suggestions = results.map((r) => ({
      id: r.id,
      name:
        type === "driver"
          ? `${r.firstname} ${r.lastname}`
          : type === "team"
          ? r.name
          : type === "season"
          ? r.year
          : r.track_name,
    }));

    return res.status(200).json(suggestions);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching suggestions", error });
  }
};

export const createBest10GameManual = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);
    if (!user || !isAdmin(user)) {
      return res
        .status(401)
        .json({ message: "Unauthorized to create Top 10 game manually" });
    }

    const gamedata = req.body;

    if (!gamedata) {
      return res.status(400).json({ message: "Bad request" });
    }

    const title = gamedata.gamedata.title;
    const date = gamedata.gamedata.date;
    const type = gamedata.gamedata.type;
    const statType = gamedata.gamedata.statType; //Table could be standings, points, podiums, etc.
    const results = gamedata.gamedata.results;

    if (!title || !date || !type || !results || !statType) {
      return res
        .status(400)
        .json({ message: "Not all fields contains a value" });
    }

    if (
      typeof title !== "string" ||
      typeof type !== "string" ||
      typeof statType !== "string" ||
      !Array.isArray(results) ||
      !results.every(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          typeof item.resultID === "string" &&
          typeof item.totalStat === "number" &&
          typeof item.position === "number"
      )
    ) {
      return res
        .status(400)
        .json({ message: "Something failed on the format to create game" });
    }

    if (results.length !== 10) {
      return res.status(400).json({
        message: `You need to have exactly 10 results, currently you have ${results.length}`,
      });
    }

    const game = {
      id: uuidv4(),
      title,
      date,
      type,
      table: statType,
      creation: Top10Creation.MANUAL,
    };

    const gameCreated = await Best_tens.create(game);

    if (!gameCreated) {
      return res
        .status(500)
        .json({ message: "There was an error while creating the game" });
    }

    const gameID = gameCreated.getDataValue("id");

    for (let result of results) {
      const top10Result = {
        id: uuidv4(),
        gameID: gameID,
        resultID: result.resultID,
        totalStat: result.totalStat,
        position: result.position,
      };

      await Manual_Best_tens_results.create(top10Result);
    }

    return res.status(200).json({ message: "Game created successfully" });
  } catch (err: any) {
    res.status(500).json({ error: "Server error", details: err });
  }
};

export const createBest10Game = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);
    if (!user || !isAdmin(user)) {
      return res
        .status(401)
        .json({ message: "Unauthorized to create Top 10 game automatically" });
    }

    const gamedata = req.body;

    if (!gamedata) {
      return res.status(400).json({ message: "Bad request" });
    }

    const year = gamedata.gamedata.year;
    const table = gamedata.gamedata.table; //Table could be standings, points, podiums, etc.
    const title = gamedata.gamedata.title;
    const fromYear = gamedata.gamedata.fromYear;
    const toYear = gamedata.gamedata.toYear;
    const nationality = gamedata.gamedata.nationality;
    const date = gamedata.gamedata.date;
    const team = gamedata.gamedata.team;
    const sqlTable = gamedata.gamedata.sqlTable;
    const type = gamedata.gamedata.type; //Type refers to if it's driver/team/track

    if (!title || !table || !sqlTable) {
      return res
        .status(400)
        .json({ message: "Not all fields contains a value" });
    }

    const game = {
      id: uuidv4(),
      title,
      year: year || null,
      fromYear: fromYear || null,
      toYear: toYear || null,
      nationality,
      table,
      date,
      team,
      sqlTable,
      type,
      creation: Top10Creation.AUTOMATIC,
    };

    const result = await Best_tens.create(game);

    if (!result) {
      return res.status(304).json({
        message:
          "Something failed on creating automatic game, please contact support",
      });
    }

    const gameID = await result.getDataValue("id");

    const validated = updateAutomaticResults(gameID, result, true);

    if (!validated) {
      await Best_tens.truncate({ where: { id: gameID } });
      return res.status(400).json({
        message:
          "Cannot create this challenge: Not enough data to complete the top 10",
      });
    }

    return res.status(200).json({ message: "Game created successfully" });
  } catch (err: any) {
    res.status(500).json({ error: "Server error", details: err });
  }
};

export const getAllGames = async (req: Request, res: Response) => {
  try {
    const games = await Best_tens.findAll({
      order: [['date', 'DESC']],
    });

    const gamesWithResults = await Promise.all(
      games.map(async (game) => {
        const results = await Best_tens_results.findAll({
          where: { gameID: game.getDataValue("id") },
          order: [['position', 'ASC']],
        });

        return {
          id: game.getDataValue("id"),
          title: game.getDataValue("title"),
          date: game.getDataValue("date"),
          type: game.getDataValue("type"),
          table: game.getDataValue("table"),
          creation: game.getDataValue("creation"),
          resultsCount: results.length,
        };
      })
    );

    return res.status(200).json(gamesWithResults);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching games", error });
  }
};

export const deleteGame = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);
    if (!user || !isAdmin(user)) {
      return res.status(401).json({ message: "Unauthorized to delete Top 10 game" });
    }

    const { gameID } = req.params;

    if (!gameID) {
      return res.status(400).json({ message: "Game ID is required" });
    }

    // Delete results first due to foreign key constraint
    await Best_tens_results.destroy({
      where: { gameID: gameID },
    });

    // Delete manual results if they exist
    await Manual_Best_tens_results.destroy({
      where: { gameid: gameID },
    });

    // Delete the game
    const deletedCount = await Best_tens.destroy({
      where: { id: gameID },
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: "Game not found" });
    }

    return res.status(200).json({ message: "Game deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting game", error });
  }
};

export const updateGame = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);
    if (!user || !isAdmin(user)) {
      return res.status(401).json({ message: "Unauthorized to update Top 10 game" });
    }

    const { gameID } = req.params;
    const gamedata = req.body;

    if (!gameID || !gamedata) {
      return res.status(400).json({ message: "Game ID and game data are required" });
    }

    const game = await Best_tens.findOne({ where: { id: gameID } });
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    const title = gamedata.gamedata.title;
    const date = gamedata.gamedata.date;
    const type = gamedata.gamedata.type;
    const statType = gamedata.gamedata.statType;
    const results = gamedata.gamedata.results;

    if (!title || !date || !type) {
      return res.status(400).json({ message: "Title, date and type are required" });
    }

    // Update game data
    await Best_tens.update(
      {
        title,
        date,
        type,
        table: statType,
      },
      { where: { id: gameID } }
    );

    // If it's a manual game, update results
    if (game.getDataValue("creation") === Top10Creation.MANUAL && results) {
      if (!Array.isArray(results) || results.length !== 10) {
        return res.status(400).json({ message: "Manual games must have exactly 10 results" });
      }

      // Delete existing results
      await Best_tens_results.destroy({ where: { gameID: gameID } });
      await Manual_Best_tens_results.destroy({ where: { gameid: gameID } });

      // Create new results
      for (let result of results) {
        const top10Result = {
          id: uuidv4(),
          gameID: gameID,
          resultID: result.resultID,
          totalStat: result.totalStat,
          position: result.position,
        };

        await Manual_Best_tens_results.create(top10Result);
      }

      // Update Best_tens_results table
      await updateManualResults(gameID);
    }

    return res.status(200).json({ message: "Game updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error updating game", error });
  }
};

export const getGameById = async (req: Request, res: Response) => {
  const { gameID } = req.params;

  if (!gameID) {
    return res.status(400).json({ message: "Game ID is required" });
  }

  try {
    const game = await Best_tens.findOne({
      where: { id: gameID },
    });

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    const results = await Best_tens_results.findAll({
      where: { gameID: gameID },
      order: [['position', 'ASC']],
    });

    // Load entity details for each result
    const resultsWithDetails = await Promise.all(
      results.map(async (result) => {
        const resultID = result.getDataValue("resultID");
        let entityDetails = null;

        try {
          // Try to find the entity based on the type
          if (game.getDataValue("type") === "driver") {
            entityDetails = await Drivers.findOne({ where: { id: resultID } });
          } else if (game.getDataValue("type") === "team") {
            entityDetails = await Teams.findOne({ where: { id: resultID } });
          } else if (game.getDataValue("type") === "track") {
            entityDetails = await Tracks.findOne({ where: { id: resultID } });
          }
        } catch (error) {
          console.log("Error loading entity details:", error);
        }

        return {
          resultID: resultID,
          totalStat: result.getDataValue("totalStat"),
          position: result.getDataValue("position"),
          entityName: entityDetails ?
            (entityDetails.getDataValue("firstname") && entityDetails.getDataValue("lastname") ?
              `${entityDetails.getDataValue("firstname")} ${entityDetails.getDataValue("lastname")}` :
              entityDetails.getDataValue("name") || entityDetails.getDataValue("track_name") || "Unknown") :
            "Unknown",
          entity: entityDetails ? entityDetails.toJSON() : null,
        };
      })
    );

    const gameData = {
      id: game.getDataValue("id"),
      title: game.getDataValue("title"),
      date: game.getDataValue("date"),
      type: game.getDataValue("type"),
      table: game.getDataValue("table"),
      creation: game.getDataValue("creation"),
      year: game.getDataValue("year"),
      fromYear: game.getDataValue("fromYear"),
      toYear: game.getDataValue("toYear"),
      nationality: game.getDataValue("nationality"),
      team: game.getDataValue("team"),
      sqlTable: game.getDataValue("sqlTable"),
      results: resultsWithDetails,
    };

    return res.status(200).json(gameData);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching game", error });
  }
};

export const getGameData = async (req: Request, res: Response) => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const challenge = await Best_tens.findOne({
    where: { date: today },
  });

  if (!challenge) {
    return res.status(404).json({ message: "No challenge found for today" });
  }

  return res.status(200).json({
    id: challenge.getDataValue("id"),
    title: challenge.getDataValue("title"),
    type: challenge.getDataValue("type"),
    table: challenge.getDataValue("table"),
  });
};

// Core function for updating Best10 game results (without HTTP dependencies)
export const updateBest10GameResultsCore = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const challenge = await Best_tens.findOne({
      where: { date: today },
    });

    if (!challenge) {
      return { success: false, message: "No challenge found" };
    }

    const creation = challenge.getDataValue("creation");

    if (!creation) {
      return {
        success: true,
        message: "Nothing to update because the method is not selected",
      };
    }

    await Best_tens_results.truncate();
    const id = challenge.getDataValue("id");

    if (creation === Top10Creation.MANUAL) {
      const updated = await updateManualResults(id);
      if (!updated) {
        return {
          success: false,
          message:
            "Something happened while getting results, unexpected amount of results",
        };
      }
    } else if (creation === Top10Creation.AUTOMATIC) {
      const updated = await updateAutomaticResults(id, challenge);
      if (!updated) {
        return { success: false, message: "No info found for that search" };
      }
    }

    return { success: true, message: "Game updated successfully" };
  } catch (err: any) {
    return { success: false, message: `Server error: ${err.message}` };
  }
};

export const updateBest10GameResults = async (req: Request, res: Response) => {
  ///THIS IS TO UPDATE RESULTS EACH DAY
  /*const user = await getUserLogged(req);
  if (!user || !isAdmin(user)) {
    return res.status(401).json({ message: "Unauthorized" });
  }*/
  const result = await updateBest10GameResultsCore();

  if (result.success) {
    return res.status(200).json({ message: result.message });
  } else {
    return res
      .status(result.message.includes("No challenge found") ? 404 : 500)
      .json({ error: result.message });
  }
};

async function updateAutomaticResults(
  id: string,
  challenge: any,
  validation?: boolean
) {
  const year = challenge.getDataValue("year");
  const fromYear = challenge.getDataValue("fromYear");
  const toYear = challenge.getDataValue("toYear");
  ///const type = gamedata.type; ///Type refers to: drivers/teams
  const nationality = challenge.getDataValue("nationality");
  const table = challenge.getDataValue("table"); ///Table refers to: points/podiums/wins/laps_led/race_Starts/standings
  const team = challenge.getDataValue("team");
  const sqlTable = challenge.getDataValue("sqlTable");

  let topStats;

  if (year && !nationality && !team) {
    topStats = await getWithoutParams(year, sqlTable, table);
  } else {
    topStats = await getWithParams(
      table,
      nationality,
      fromYear,
      toYear,
      year,
      team,
      sqlTable
    );
  }
  if (!topStats) {
    return false;
  }

  topStats.forEach(async (result, index) => {
    const resultID = getID(sqlTable, result);
    const best10 = {
      id: uuidv4(),
      gameID: id,
      resultID: resultID,
      totalStat: result.getDataValue("totalStat"),
      position: index + 1,
    };

    if (!validation) {
      await Best_tens_results.create(best10);
    } else if (validation === true) {
      return topStats.length === 10;
    }
  });

  return true;
}

async function updateManualResults(id: string) {
  const results = await Manual_Best_tens_results.findAll({
    where: { gameid: id },
  });

  if (results.length !== 10) {
    return false;
  }

  for (let result of results) {
    await Best_tens_results.create(result.toJSON());
  }
  return true;
}

function getID(sqlTable: string, result: any) {
  let resultID = "";
  switch (sqlTable) {
    case "Season_Teams_Drivers":
      resultID = result.getDataValue("driverID");
      break;
    case "Season_Teams":
      resultID = result.getDataValue("teamID");
      break;
    case "Season_Tracks":
      resultID = result.getDataValue("trackID");
      break;
  }

  return resultID;
}

async function getWithoutParams(year: number, sqlTable: string, table: string) {
  let topStats;
  const seasonID = await findSeason(year);

  switch (sqlTable) {
    case "Season_Teams_Drivers":
      topStats = await findStdBySeason(seasonID, table, "DESC");
      break;
    case "Season_Teams":
      topStats = await findSeasonTeamsBySeason(seasonID, table, "DESC");
      break;
    case "Season_Tracks":
      topStats = await findSeasonTracksBySeason(seasonID, table, "DESC");
      break;
    default:
      topStats = undefined;
      break;
  }

  return topStats;
}

async function getWithParams(
  table: string,
  nationality: string,
  fromYear: number,
  toYear: number,
  year: number,
  team: string,
  sqlTable: string
) {
  const options: StatQueryOptions = {
    stat: table,
    nationality,
    fromYear,
    toYear,
    seasonYear: year,
    team,
  };

  let topStats;

  switch (sqlTable) {
    case "Season_Teams_Drivers":
      topStats = await getTopDriversByStat(options);
      break;
    case "Season_Teams":
      topStats = await getTopTeamsByStat(options);
      break;
    case "Season_Tracks":
      topStats = await getTopTracksByStat(options);
      break;
    default:
      topStats = undefined;
      break;
  }

  return topStats;
}

async function findSeason(year: number) {
  try {
    const season = await Seasons.findOne({ where: { year: year } });

    if (!season) {
      return undefined;
    }

    return season.getDataValue("id");
  } catch (error) {
    console.log("ERROR: ", error);
    return undefined;
  }
}

async function findStdBySeason(seasonID: string, table: string, type: string) {
  ///Type means DESC or ASC
  try {
    const std = await Season_Teams_Drivers.findAll({
      where: { seasonID },
      include: [
        {
          model: Drivers,
          attributes: ["firstname", "lastname", "nationality", "image"],
        },
      ],
      attributes: ["driverID", [fn("SUM", col(table)), "totalStat"]],
      group: ["Season_Teams_Drivers.driverID"], // ← agrupás por driver
      order: [[literal("totalStat"), type]], // ← ordenás por el alias
      limit: 10,
    });

    if (!std) {
      return undefined;
    }

    return std;
  } catch (error) {
    console.log("ERROR: ", error);
    return undefined;
  }
}

async function findSeasonTeamsBySeason(
  seasonID: string,
  table: string,
  type: string
) {
  ///Type means DESC or ASC
  try {
    const std = await Season_Teams.findAll({
      where: { seasonID: seasonID },
      include: [
        {
          model: Teams,
          attributes: [
            "id",
            "name",
            "common_name",
            "championships",
            "base",
            "logo",
          ],
        },
      ],
      order: [[table, type]], // o 'ASC' si querés orden ascendente
      limit: 10,
    });

    if (!std) {
      return undefined;
    }

    return std;
  } catch (error) {
    console.log("ERROR: ", error);
    return undefined;
  }
}

async function findSeasonTracksBySeason(
  seasonID: string,
  table: string,
  type: string
) {
  ///Type means DESC or ASC
  try {
    const std = await Season_Tracks.findAll({
      where: { seasonID: seasonID },
      include: [
        {
          model: Tracks,
          attributes: [
            "id",
            "location",
            "track_name",
            "gmt_offset",
            "length",
            "country",
            "image",
          ],
        },
      ],
      order: [[table, type]], // o 'ASC' si querés orden ascendente
      limit: 10,
    });

    if (!std) {
      return undefined;
    }

    return std;
  } catch (error) {
    console.log("ERROR: ", error);
    return undefined;
  }
}

async function getTopDriversByStat(options: StatQueryOptions) {
  const {
    stat,
    nationality,
    fromYear,
    toYear,
    seasonYear,
    limit = 10,
    order = "DESC",
  } = options;

  try {
    const whereSeason: any = {};
    if (seasonYear) {
      whereSeason.year = seasonYear.toString();
    } else if (fromYear && toYear) {
      whereSeason.year = {
        [Op.between]: [fromYear.toString(), toYear.toString()],
      };
    }

    const results = await Season_Teams_Drivers.findAll({
      include: [
        {
          model: Drivers,
          attributes: ["id", "firstname", "lastname", "nationality", "image"],
          ...(nationality && { where: { nationality } }),
        },
        {
          model: Seasons,
          attributes: [],
          ...(Object.keys(whereSeason).length && { where: whereSeason }),
        },
      ],
      attributes: ["driverID", [fn("SUM", col(stat)), "totalStat"]],
      group: ["driverID", "Driver.id"],
      order: [[literal("totalStat"), order]],
      limit,
    });

    console.log("RESULTS: ", results);

    return results;
  } catch (error) {
    console.error("Error in getTopDriversByStat:", error);
    return undefined;
  }
}

async function getTopTeamsByStat(options: StatQueryOptions) {
  const {
    stat,
    fromYear,
    toYear,
    seasonYear,
    limit = 10,
    order = "DESC",
  } = options;

  try {
    const whereSeason: any = {};
    if (seasonYear) {
      whereSeason.year = seasonYear.toString();
    } else if (fromYear && toYear) {
      whereSeason.year = {
        [Op.between]: [fromYear.toString(), toYear.toString()],
      };
    }

    const results = await Season_Teams.findAll({
      include: [
        {
          model: Teams,
          attributes: [
            "id",
            "name",
            "common_name",
            "championships",
            "base",
            "logo",
          ],
        },
        {
          model: Seasons,
          attributes: [],
          ...(Object.keys(whereSeason).length && { where: whereSeason }),
        },
      ],
      attributes: ["teamID", [fn("SUM", col(stat)), "totalStat"]],
      group: ["teamID", "Team.id"],
      order: [[literal("totalStat"), order]],
      limit,
    });

    return results;
  } catch (error) {
    console.error("Error in getTopTeamsByStat:", error);
    return undefined;
  }
}

async function getTopTracksByStat(options: StatQueryOptions) {
  const {
    stat,
    nationality,
    fromYear,
    toYear,
    seasonYear,
    limit = 10,
    order = "DESC",
  } = options;

  try {
    const whereSeason: any = {};
    if (seasonYear) {
      whereSeason.year = seasonYear.toString();
    } else if (fromYear && toYear) {
      whereSeason.year = {
        [Op.between]: [fromYear.toString(), toYear.toString()],
      };
    }

    const results = await Season_Teams_Drivers.findAll({
      include: [
        {
          model: Drivers,
          attributes: [
            "id",
            "location",
            "track_name",
            "gmt_offset",
            "length",
            "country",
            "image",
          ],
          ...(nationality && { where: { nationality } }),
        },
        {
          model: Seasons,
          attributes: [],
          ...(Object.keys(whereSeason).length && { where: whereSeason }),
        },
      ],
      attributes: ["driverID", [fn("SUM", col(stat)), "totalStat"]],
      group: ["driverID", "Driver.id"],
      order: [[literal("totalStat"), order]],
      limit,
    });

    return results;
  } catch (error) {
    console.error("Error in getTopDriversByStat:", error);
    return undefined;
  }
}
