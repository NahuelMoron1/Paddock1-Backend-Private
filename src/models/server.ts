import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import morgan from "morgan";
import path from "path";
import cron from "node-cron";
import { Op } from "sequelize";

//routes
import FEwebhookRouter from "../FEwebhook";
import best10Router from "../routes/Best_tens";
import connectionsRouter from "../routes/Connections";
import guessCareersRouter from "../routes/GuessCareers";
import guessTeamsRouter from "../routes/GuessTeams";
import h2hGamesRouter from "../routes/H2HGames";
import impostorRouter from "../routes/Impostors";
import Seasons_TeamsRouter from "../routes/Season_Teams";
import Seasons_Teams_DriversRouter from "../routes/Season_Teams_Drivers";
import Seasons_TracksRouter from "../routes/Season_Tracks";
import SeasonsRouter from "../routes/Seasons";
import TeamsRouter from "../routes/Teams";
import TracksRouter from "../routes/Tracks";
import wordleRouter from "../routes/Wordle";
import webhookRouter from "../webhook";
import usersRouter from "../routes/Users";
import cookieRouter from "../routes/Cookie";
import slackRouter from "../routes/Slack";

//functions
import { updateBest10GameResultsCore } from "../controllers/Best_tens";

//models
import { Drivers } from "../models/mysql/associations";
import WordleWord from "../models/mysql/WordleWord";

//database settings
import db from "../db/connection";
import { ALLOWED_ORIGINS, DB_NAME, MAINTENANCE, PORT } from "./config";

class Server {
  private app: Application;
  private port?: string;
  constructor() {
    this.app = express();
    this.port = PORT;
    this.listen();
    this.middlewares();
    this.routes();
    this.dbConnect();
    this.scheduleDailyUpdates();
  }
  listen() {
    this.app.listen(this.port, () => {
      console.log("server listening on port ", this.port);
    });
  }
  routes() {
    this.app.get("/", (req: Request, res: Response) => {
      res.json({ msg: "api working" });
    });
    this.app.use("/api/seasons", SeasonsRouter);
    this.app.use("/api/tracks", TracksRouter);
    this.app.use("/api/teams", TeamsRouter);
    this.app.use("/api/seasons_tracks", Seasons_TracksRouter);
    this.app.use("/api/seasons_teams", Seasons_TeamsRouter);
    this.app.use("/api/seasons_teams_drivers", Seasons_Teams_DriversRouter);
    this.app.use("/api/wordle", wordleRouter);
    this.app.use("/api/best10", best10Router);
    this.app.use("/api/impostor", impostorRouter);
    this.app.use("/api/connections", connectionsRouter);
    this.app.use("/api/guessTeams", guessTeamsRouter);
    this.app.use("/api/guessCareers", guessCareersRouter);
    this.app.use("/api/h2h", h2hGamesRouter);
    this.app.use("/api/users", usersRouter);
    this.app.use("/api/cookie", cookieRouter);
    this.app.use("/api/slack", slackRouter);
  }
  middlewares() {
    this.app.use(
      "/uploads",
      express.static(path.join(__dirname, "../../uploads"))
    );
    this.app.use(
      "/backups",
      express.static(path.join(__dirname, "../../backups"))
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use("/webhook", webhookRouter);
    this.app.use("/fewebhook", FEwebhookRouter);
    this.app.use(cookieParser());
    this.app.use(morgan("dev"));
    this.app.use(
      cors({
        origin: ALLOWED_ORIGINS,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        credentials: true,
      })
    );
  }
  async dbConnect() {
    if (!MAINTENANCE) {
      try {
        await db.authenticate();
        console.log("DATABASE CONNECTED: " + DB_NAME);
      } catch (err) {
        console.log("You have an error");
        console.log(err);
      }
    }
  }

  private scheduleDailyUpdates() {
    // Schedule daily update at 00:00 GMT (midnight UTC)
    cron.schedule(
      "0 0 * * *",
      async () => {
        console.log(
          "🕐 Running scheduled daily update for Best10 game results..."
        );

        try {
          const result = await updateBest10GameResultsCore();

          if (result.success) {
            console.log(
              "✅ Daily update completed successfully:",
              result.message
            );
          } else {
            console.error("❌ Daily update failed:", result.message);
          }
        } catch (error) {
          console.error("💥 Unexpected error during scheduled update:", error);
        }

        // Generate daily Wordle word
        try {
          console.log("🎯 Generating daily Wordle word...");

          const count = await Drivers.count({
            where: {
              popularity: {
                [Op.between]: [3, 5],
              },
            },
          });

          const offset = Math.floor(Math.random() * count);

          const recentWords = await WordleWord.findAll({
            order: [["date", "DESC"]],
            limit: 7,
          });

          const excluded = recentWords.map((w) => w.getDataValue("word"));

          const driver = await Drivers.findOne({
            where: {
              popularity: {
                [Op.between]: [3, 5],
              },
              lastname: {
                [Op.notIn]: excluded,
              },
            },
            offset,
          });

          if (driver) {
            const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

            await WordleWord.upsert({
              date: today,
              word: driver.getDataValue("lastname").toLowerCase(),
            });

            console.log(`✅ Wordle actualizado: ${driver.getDataValue("lastname")}`);
          } else {
            console.log("⚠️ No suitable driver found for Wordle word generation");
          }
        } catch (error) {
          console.error("💥 Error generating daily Wordle word:", error);
        }
      },
      {
        timezone: "GMT",
      }
    );

    console.log(
      "📅 Daily update scheduler initialized (runs at 00:00 GMT daily)"
    );
  }
}
export default Server;