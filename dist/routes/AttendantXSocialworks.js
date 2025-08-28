"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AttendantXSocialworks_1 = require("../controllers/AttendantXSocialworks");
const router = (0, express_1.Router)();
router.post("/", AttendantXSocialworks_1.postAttendantXSocialwork);
router.delete("/delete/:attendantID/:socialworkID", AttendantXSocialworks_1.deleteAttendantXSocialwork);
exports.default = router;
