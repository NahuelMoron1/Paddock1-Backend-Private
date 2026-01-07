import { Router } from "express";
import {
  createGame,
  createGroup,
  createResults,
  getAllConnections,
  getGameByID,
  getGroupsByGameID,
  getResultsByGroupID,
  deleteGroup,
  deleteGameResults,
  updateGame,
} from "../controllers/Connections";

const router = Router();

router.get("/all/connections", getAllConnections);
router.get("/one/connection/:gameID", getGameByID);
router.get("/all/groups/:gameID", getGroupsByGameID);
router.get("/all/results/:groupID/:type", getResultsByGroupID);
router.post("/create/game", createGame);
router.post("/create/group", createGroup);
router.post("/create/result", createResults);
router.post("/update/game/:gameID", updateGame);
router.delete("/delete/group/:groupID", deleteGroup);
router.delete("/delete/result/:groupID/:resultID", deleteGameResults);

export default router;
