"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Socialworks_1 = require("../controllers/Socialworks");
const router = (0, express_1.Router)();
router.get("/socialworks/active", Socialworks_1.getActiveSocialworks);
router.get("/socialworks/inactive", Socialworks_1.getinActiveSocialworks);
router.get("/socialworks/all", Socialworks_1.getAllSocialworks);
router.get("/set/active/:id", Socialworks_1.SetActiveSocialwork);
router.get("/set/inactive/:id", Socialworks_1.SetinActiveSocialwork);
router.get("/name/:attendantID", Socialworks_1.getSocialworkByAttendant);
router.get("/name/modify/:attendantID", Socialworks_1.getSocialworkByAttendantModify);
router.post("/", Socialworks_1.postSocialwork); /// TO DO
//router.post("/", upload.single("file"), postSocialwork); /// TO DO
exports.default = router;
