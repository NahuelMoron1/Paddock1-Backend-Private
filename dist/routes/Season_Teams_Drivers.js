"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Season_Teams_Drivers_1 = require("../controllers/Season_Teams_Drivers");
const router = (0, express_1.Router)();
router.get("/all", Season_Teams_Drivers_1.getAllSeason_Teams_Drivers);
router.get("/year/:year", Season_Teams_Drivers_1.getBySeason_Teams_Drivers);
router.get("/create", Season_Teams_Drivers_1.createSeason);
exports.default = router;
