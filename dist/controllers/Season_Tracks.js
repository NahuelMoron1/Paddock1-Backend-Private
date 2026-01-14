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
exports.modifySeason_track = exports.addSeason_track = exports.deleteSeason_track = exports.getAllSeason_tracks = void 0;
const Seasons_Tracks_1 = __importDefault(require("../models/mysql/Seasons_Tracks"));
const getAllSeason_tracks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const season_tracks = yield Seasons_Tracks_1.default.findAll();
        if (!season_tracks) {
            return res.status(404).json({ message: "No season_tracks found" });
        }
        return res.json(season_tracks);
    }
    catch (err) {
        return res.status(500).json({ message: err });
    }
});
exports.getAllSeason_tracks = getAllSeason_tracks;
const deleteSeason_track = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Bad request" });
        }
        const season_track = yield Seasons_Tracks_1.default.findByPk(id);
        if (!season_track) {
            return res
                .status(404)
                .json({ message: "No season_track found to delete" });
        }
        yield season_track.destroy();
        return res.status(200).json({ message: "Successfully deleted" });
    }
    catch (err) {
        return res.status(500).json({ message: err });
    }
});
exports.deleteSeason_track = deleteSeason_track;
const addSeason_track = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const season_track = req.body;
        const validated = validateSeasonTrack(season_track.seasonID, season_track.trackID, season_track.round_number, season_track.laps);
        if (!validated) {
            return res.status(400).json({ message: "Bad request" });
        }
        const season_tracks = season_track;
        yield Seasons_Tracks_1.default.create(season_tracks);
        return res.status(200).json({
            message: `Successfully added a season_track`,
        });
    }
    catch (err) {
        return res.status(500).json({ message: err });
    }
});
exports.addSeason_track = addSeason_track;
const modifySeason_track = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newSeason_track = req.body;
        if (!newSeason_track) {
            return res.status(400).json({ message: "Bad request" });
        }
        const validated = validateSeasonTrack(newSeason_track.seasonID, newSeason_track.trackID, newSeason_track.round_number, newSeason_track.laps);
        if (!newSeason_track.id || !validated) {
            return res
                .status(400)
                .json({ message: "Not all fields contains a value" });
        }
        yield Seasons_Tracks_1.default.update({
            seasonID: newSeason_track.seasonID,
            trackID: newSeason_track.trackID,
            round_number: newSeason_track.round_number,
            laps: newSeason_track.laps,
            sprint: newSeason_track.sprint || false,
        }, { where: { id: newSeason_track.id } });
        return res.status(200).json({
            message: `Successfully updated the season_team ${newSeason_track.id}`,
        });
    }
    catch (err) {
        return res.status(500).json({ message: err });
    }
});
exports.modifySeason_track = modifySeason_track;
function validateSeasonTrack(seasonID, trackID, round_number, laps) {
    if (!seasonID || !trackID || !round_number || !laps) {
        return false;
    }
    return true;
}
