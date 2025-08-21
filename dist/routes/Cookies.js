"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Cookies_1 = require("../controllers/Cookies");
const router = (0, express_1.Router)();
router.get('/check/:cookieName', Cookies_1.tokenExist);
router.get('/get/:cookieName', Cookies_1.getToken);
router.get('/superadmin/:admin', Cookies_1.superAdminCheck);
exports.default = router;
