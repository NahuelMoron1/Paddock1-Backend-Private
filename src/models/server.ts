import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import morgan from "morgan";
import path from "path";
import cron from "node-cron";

//routes
import FEwebhookRouter from "../FEwebhook";
import best10Router from "../routes/Best_tens";
import connectionsRouter from "../routes/Connections";
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

//functions
import { updateBest10GameResultsCore } from "../controllers/Best_tens";

//database settings
import db from "../db/connection";
import { DB_NAME, MAINTENANCE, PORT } from "./config";

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
    this.app.use("/api/h2h", h2hGamesRouter);
  }
  middlewares() {
    const allowedOrigins = [
      "https://api.pdk1gameprivate.online",
      "https://www.pdk1gameprivate.online",
    ];
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
        origin: allowedOrigins,
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
