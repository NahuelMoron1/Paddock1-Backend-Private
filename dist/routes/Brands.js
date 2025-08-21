"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("../middlewares/multer"));
const Brands_1 = require("../controllers/Brands");
const router = (0, express_1.Router)();
router.get("/", Brands_1.getBrands);
router.get("/:id", Brands_1.getBrand);
router.delete("/:id", Brands_1.deleteBrand);
router.delete("/:", Brands_1.deleteBrands);
router.post("/", multer_1.default.single("file"), Brands_1.postBrands);
router.patch("/:id", Brands_1.updateBrand);
exports.default = router;
