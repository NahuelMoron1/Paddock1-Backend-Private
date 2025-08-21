"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const export_1 = require("../controllers/export");
const router = (0, express_1.Router)();
router.post("/:type", export_1.exportTables);
exports.default = router;
