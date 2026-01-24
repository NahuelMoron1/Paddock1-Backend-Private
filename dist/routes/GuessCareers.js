"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GuessCareers_1 = require("../controllers/GuessCareers");
const router = (0, express_1.Router)();
// Rutas para GuessCareers
router.get("/", GuessCareers_1.getAllGuessCareersGames);
router.get("/:id", GuessCareers_1.getGameById);
router.post("/", GuessCareers_1.createGuessCareersGame);
router.put("/:id", GuessCareers_1.updateGame);
router.delete("/:id", GuessCareers_1.deleteGame);
exports.default = router;
