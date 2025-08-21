import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";

//routes
import usersRouter from "../routes/Users";
import availabilityRouter from "../routes/Availability";
import turnsRouter from "../routes/Turns";
import reviewsRouter from "../routes/Reviews";
import cookieRouter from "../routes/Cookie";
import socialworkRouter from "../routes/Socialworks";

//database settings
import db from "../db/connection";
import { DB_NAME, PORT } from "./config";
import { MAINTENANCE } from "./config";

class Server {
  private app: Application;
  private port: string;
  constructor() {
    this.app = express();
    this.port = PORT || "3001";
    this.listen();
    this.middlewares();
    this.routes();
    this.dbConnect();
  }
  listen() {
    this.app.listen(this.port, () => {
      console.log(`server listening on port ${this.port}`);
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
  }
  middlewares() {
    const allowedOrigins = ["http://localhost:4200"];
    this.app.use(
      "/uploads",
      express.static(path.join(__dirname, "../../uploads"))
    );
    this.app.use(
      "/backups",
      express.static(path.join(__dirname, "../../backups"))
    );
    this.app.use(express.json());
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
