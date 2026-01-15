"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Impostors_1 = require("../controllers/Impostors");
const router = (0, express_1.Router)();
router.post("/candidates", Impostors_1.findCandidates);
router.post("/create", Impostors_1.createImpostorGame);
router.get("/files", Impostors_1.removeBackgroundForImages);
// Nuevas rutas para la gestión de juegos
router.get("/games", Impostors_1.getAllImpostorGames);
router.get("/game/:id", Impostors_1.getGameById);
router.put("/update/:id", Impostors_1.updateGame);
exports.default = router;
