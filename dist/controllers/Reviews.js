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
exports.deleteAttendantReview = exports.modifyReview = exports.setAttendantReview = exports.getUserReview = exports.getUserReviews = exports.getAttendantReviews = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../models/config");
const UserRole_1 = require("../models/enums/UserRole");
const UserStatus_1 = require("../models/enums/UserStatus");
const Reviews_1 = __importDefault(require("../models/mysql/Reviews"));
const Users_1 = __importDefault(require("../models/mysql/Users"));
const Users_2 = require("../models/Users");
const getAttendantReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { attendantID } = req.params;
        if (!attendantID) {
            return res
                .status(400)
                .json({ message: "Not all fields contains a value" });
        }
        const reviewsAux = yield Reviews_1.default.findAll({
            where: { attendantID: attendantID },
            include: [
                {
                    model: Users_1.default,
                    as: "User", // ← cliente
                    attributes: ["fullName", "profileImage"],
                },
            ],
        });
        if (!reviewsAux) {
            return res.status(404).json({ message: "No reviews found" });
        }
        return res.json(reviewsAux);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getAttendantReviews = getAttendantReviews;
const getUserReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userID } = req.params;
        if (!userID) {
            return res
                .status(400)
                .json({ message: "Not all fields contains a value" });
        }
        const reviewsAux = yield Reviews_1.default.findAll({
            where: { userID: userID },
            include: [
                {
                    model: Users_1.default,
                    as: "User", // ← cliente
                    attributes: ["fullName", "profileImage"],
                },
                {
                    model: Users_1.default,
                    as: "Attendant",
                    attributes: ["fullName", "profileImage"],
                },
            ],
        });
        if (!reviewsAux) {
            return res.status(404).json({ message: "No reviews found" });
        }
        return res.json(reviewsAux);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getUserReviews = getUserReviews;
const getUserReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userID, attendantID } = req.params;
        if (!userID || !attendantID) {
            return res
                .status(400)
                .json({ message: "Not all fields contains a value" });
        }
        const reviewsAux = yield Reviews_1.default.findOne({
            where: { userID: userID, attendantID: attendantID },
        });
        if (!reviewsAux) {
            return res.status(404).json({ message: "No review found" });
        }
        return res.json(reviewsAux);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getUserReview = getUserReview;
const setAttendantReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user) {
            return res
                .status(401)
                .json({ message: "You're not allowed to see this information." });
        }
        const { attendantID, rating, comment } = req.body;
        if (!validateReview(attendantID, rating, comment)) {
            return res
                .status(400)
                .json({ message: "Not all fields contains a value" });
        }
        if (user.role !== UserRole_1.UserRole.CLIENT) {
            return res
                .status(304)
                .json({ message: "Cannot set a review if you are admin or attendant" });
        }
        const userID = user.id;
        const date = new Date();
        const reviewAux = {
            userID,
            attendantID,
            rating,
            comment: comment || null,
            dateCreated: date,
        };
        yield Reviews_1.default.create(reviewAux);
        return res.status(200).json({ message: "Reseña creada correctamente" });
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.setAttendantReview = setAttendantReview;
const modifyReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user) {
            return res
                .status(401)
                .json({ message: "You're not allowed to see this information." });
        }
        const review = req.body;
        if (!validateReview(review.attendantID, review.rating, review.comment) ||
            !review.id) {
            return res
                .status(400)
                .json({ message: "No todos los campos contienen un valor" });
        }
        if (user.role !== UserRole_1.UserRole.CLIENT) {
            return res.status(304).json({
                message: "Cannot modify a review if you are admin or attendant",
            });
        }
        const reviewToDelete = yield Reviews_1.default.findByPk(review.id);
        if (!reviewToDelete) {
            return res
                .status(404)
                .json({ message: "No se encontró la reseña a modificar" });
        }
        yield reviewToDelete.destroy();
        const userID = user.id;
        const date = new Date();
        const reviewAux = {
            id: review.id,
            userID,
            attendantID: review.attendantID,
            rating: review.rating,
            comment: review.comment || null,
            dateCreated: date,
        };
        yield Reviews_1.default.create(reviewAux);
        return res.status(200).json({ message: "Reseña creada correctamente" });
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.modifyReview = modifyReview;
function validateReview(attendantID, rating, comment) {
    if (!attendantID || !rating) {
        return false;
    }
    if (comment && typeof comment !== "string") {
        return false;
    }
    return true;
}
const deleteAttendantReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user) {
            return res
                .status(401)
                .json({ message: "You're not allowed to see this information." });
        }
        const { id } = req.params;
        if (!id) {
            return res
                .status(400)
                .json({ message: "Not all fields contains a value." });
        }
        const reviewToDelete = yield Reviews_1.default.findByPk(id);
        if (!reviewToDelete) {
            return res.status(404).json({ message: "Review not found" });
        }
        if (reviewToDelete.getDataValue("userID") !== user.id) {
            return res
                .status(401)
                .json({ message: "You're not allowed to see this information." });
        }
        yield reviewToDelete.destroy();
        return res
            .status(200)
            .send({ message: "Review successfully deleted by user" });
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.deleteAttendantReview = deleteAttendantReview;
function getUserLogged(req) {
    return __awaiter(this, void 0, void 0, function* () {
        let access = req.cookies["access_token"];
        let user = new Users_2.User("", "", "", "", "", "", UserRole_1.UserRole.CLIENT, UserStatus_1.UserStatus.ACTIVE, "", "");
        if (access) {
            let userAux = yield getToken(access);
            if (userAux) {
                user = userAux;
            }
            return user;
        }
        return undefined;
    });
}
function getToken(tokenAux) {
    return __awaiter(this, void 0, void 0, function* () {
        let user = new Users_2.User("", "", "", "", "", "", UserRole_1.UserRole.CLIENT, UserStatus_1.UserStatus.ACTIVE, "", "");
        try {
            const data = jsonwebtoken_1.default.verify(tokenAux, config_1.SECRET_JWT_KEY);
            if (typeof data === "object" && data !== null) {
                user = data; // Casting si estás seguro que data contiene propiedades de User
                return user;
            }
            else {
                return null;
            }
        }
        catch (error) {
            return null;
        }
    });
}
