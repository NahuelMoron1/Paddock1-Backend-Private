"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GuessTeams_1 = require("../controllers/GuessTeams");
const router = (0, express_1.Router)();
router.post("/", GuessTeams_1.createGuessTeamGame);
exports.default = router;
