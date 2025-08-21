"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("../middlewares/multer"));
const Categories_1 = require("../controllers/Categories");
const router = (0, express_1.Router)();
router.get("/", Categories_1.getCategories);
router.get("/:id", Categories_1.getCategory);
router.get("/name/:name", Categories_1.getCategoryByName);
router.delete("/:id", Categories_1.deleteCategory);
router.delete("/:", Categories_1.deleteCategories);
router.post("/", multer_1.default.single("file"), Categories_1.postCategory);
router.patch("/:id", Categories_1.updateCategory);
exports.default = router;
