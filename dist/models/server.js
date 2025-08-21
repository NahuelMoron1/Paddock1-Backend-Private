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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
//routes
const Users_1 = __importDefault(require("../routes/Users"));
const Availability_1 = __importDefault(require("../routes/Availability"));
const Turns_1 = __importDefault(require("../routes/Turns"));
const Reviews_1 = __importDefault(require("../routes/Reviews"));
const Cookie_1 = __importDefault(require("../routes/Cookie"));
const Socialworks_1 = __importDefault(require("../routes/Socialworks"));
const webhook_1 = __importDefault(require("../webhook"));
//database settings
const connection_1 = __importDefault(require("../db/connection"));
const config_1 = require("./config");
const config_2 = require("./config");
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = config_1.PORT;
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
        this.app.get("/", (req, res) => {
            res.json({ msg: "api working" });
        });
        this.app.use("/api/users", Users_1.default);
        this.app.use("/api/availability", Availability_1.default);
        this.app.use("/api/turns", Turns_1.default);
        this.app.use("/api/reviews", Reviews_1.default);
        this.app.use("/api/cookie", Cookie_1.default);
        this.app.use("/api/socialworks", Socialworks_1.default);
        this.app.use("/webhook", webhook_1.default);
    }
    middlewares() {
        const allowedOrigins = [
            "http://localhost:4200",
            "https://www.safe-365.online",
            "https://api.safe-365.online",
        ];
        this.app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../../uploads")));
        this.app.use("/backups", express_1.default.static(path_1.default.join(__dirname, "../../backups")));
        this.app.use(express_1.default.json());
        this.app.use("/webhook", webhook_1.default);
        this.app.use((0, cookie_parser_1.default)());
        this.app.use((0, morgan_1.default)("dev"));
        this.app.use((0, cors_1.default)({
            origin: allowedOrigins,
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            credentials: true,
        }));
    }
    dbConnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!config_2.MAINTENANCE) {
                try {
                    yield connection_1.default.authenticate();
                    console.log("DATABASE CONNECTED: " + config_1.DB_NAME);
                }
                catch (err) {
                    console.log("You have an error");
                    console.log(err);
                }
            }
        });
    }
}
exports.default = Server;
