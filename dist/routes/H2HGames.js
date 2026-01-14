"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const H2HGames_1 = require("../controllers/H2HGames");
const router = (0, express_1.Router)();
// Rutas para H2H Games
router.get("/", H2HGames_1.getAllH2HGames);
router.get("/:id", H2HGames_1.getH2HGameById);
router.post("/", H2HGames_1.createH2HGame);
router.put("/:id", H2HGames_1.updateH2HGame);
router.delete("/:id", H2HGames_1.deleteH2HGame);
exports.default = router;
