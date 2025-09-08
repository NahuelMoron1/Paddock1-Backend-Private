import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import morgan from "morgan";
import path from "path";

//routes
import swaggerUi from "swagger-ui-express";
import FEwebhookRouter from "../FEwebhook";
import attendantXSocialworkRouter from "../routes/AttendantXSocialworks";
import availabilityRouter from "../routes/Availability";
import cookieRouter from "../routes/Cookie";
import reviewsRouter from "../routes/Reviews";
import slackRouter from "../routes/Slack";
import socialworkRouter from "../routes/Socialworks";
import turnsRouter from "../routes/Turns";
import usersRouter from "../routes/Users";
import webhookRouter from "../webhook";

//database settings
import { specs } from "../controllers/Swagger";
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
    this.app.use("/api/users", usersRouter);
    this.app.use("/api/availability", availabilityRouter);
    this.app.use("/api/turns", turnsRouter);
    this.app.use("/api/reviews", reviewsRouter);
    this.app.use("/api/cookie", cookieRouter);
    this.app.use("/api/socialworks", socialworkRouter);
    this.app.use("/api/attendantXSocialwork", attendantXSocialworkRouter);
    this.app.use("/api/slack", slackRouter);
    this.app.use("/fewebhook", FEwebhookRouter);
    this.app.use("/webhook", webhookRouter);
    this.app.use("/webhook", webhookRouter);
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
  }
  middlewares() {
    const allowedOrigins = [
      "http://localhost:4200",
      "https://www.safe-365.online",
      "https://api.safe-365.online",
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
}
export default Server;
