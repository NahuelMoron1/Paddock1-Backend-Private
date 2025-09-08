import { Router } from "express";
import {
  getActiveAttendants,
  getAdminUsersBySocialwork,
  getAllAttendants,
  getAttendantsBySocialwork,
  getInactiveAttendants,
  getUser,
  getUserByName,
  getUsersByAdmin,
  login,
  logout,
  modifyUser,
  modifyUserByAdmin,
  postUser,
  SetActiveAttendants,
  SetInactiveAttendants,
  validatePasswordModal,
} from "../controllers/Users";
import upload from "../middlewares/multer";

const router = Router();

router.get("/:id", getUser);
router.get("/attendants/active", getActiveAttendants);
router.get("/attendants/inactive", getInactiveAttendants);
router.get("/attendants/all", getAllAttendants);
router.get("/attendants/active/:id", SetActiveAttendants);
router.get("/attendants/inactive/:id", SetInactiveAttendants);
router.get("/attendants/socialworks/:socialworkID", getAttendantsBySocialwork);
router.get("/name/:username", getUserByName);
router.get("/admin/list/:userRole/:userStatus", getUsersByAdmin);
router.get(
  "/admin/users/:socialworkID/:userRole/:userStatus",
  getAdminUsersBySocialwork
);
router.post("/", upload.single("file"), postUser);
router.post("/modify", upload.single("file"), modifyUser);
router.post("/admin/modify", upload.single("file"), modifyUserByAdmin);
router.post("/login", login);
router.post("/logout", logout);
router.post("/validate/password", validatePasswordModal);

export default router;
