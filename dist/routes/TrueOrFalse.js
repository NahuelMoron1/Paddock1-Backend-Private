"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TrueOrFalse_1 = require("../controllers/TrueOrFalse");
const router = (0, express_1.Router)();
// Rutas para True or False Games
router.get("/", TrueOrFalse_1.getAllTrueOrFalseGames);
router.get("/:id", TrueOrFalse_1.getGameById);
router.post("/", TrueOrFalse_1.createTrueOrFalseGame);
router.put("/:id", TrueOrFalse_1.updateTrueOrFalseGame);
router.delete("/:id", TrueOrFalse_1.deleteTrueOrFalseGame);
exports.default = router;
