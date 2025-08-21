"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Voucher_1 = require("../controllers/Voucher");
const router = (0, express_1.Router)();
router.post('/', Voucher_1.uploads, Voucher_1.uploadFile);
router.get('/', Voucher_1.getFiles);
exports.default = router;
