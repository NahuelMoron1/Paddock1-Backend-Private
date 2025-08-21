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
exports.validatePasswordModal = exports.logout = exports.login = exports.recoverPassword = exports.deleteImage = exports.postImage = exports.modifyUser = exports.modifyUserByAdmin = exports.postUser = exports.getAdminUsersBySocialwork = exports.getAttendantsBySocialwork = exports.getUserByName = exports.SetInactiveAttendants = exports.SetActiveAttendants = exports.getUsersByAdmin = exports.getAllAttendants = exports.getInactiveAttendants = exports.getActiveAttendants = exports.getUser = void 0;
const associations_1 = require("../models/mysql/associations");
const Users_1 = require("../models/Users");
const UserRole_1 = require("../models/enums/UserRole");
const UserStatus_1 = require("../models/enums/UserStatus");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../models/config");
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const associations_2 = require("../models/mysql/associations");
const associations_3 = require("../models/mysql/associations");
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userAux = yield getUserLogged(req);
        if (userAux) {
            return res
                .status(401)
                .json({ message: "You are not allowed to enter here." });
        }
        const { id } = req.params;
        // Paso 1: obtenemos el usuario sin relaciones para saber su rol
        const user = yield associations_1.Users.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        // Paso 2: armamos el include según su rol
        const include = [
            {
                model: associations_3.Socialworks, // relación directa (Users.socialworkID)
                where: { active: true },
                attributes: ["name"],
                required: false,
            },
        ];
        // Solo agregamos el include de AttendantXSocialworks si el rol es 'attendant'
        if (user.getDataValue("role") === UserRole_1.UserRole.ATTENDANT) {
            include.push({
                model: associations_2.AttendantXSocialworks,
                attributes: ["id"],
                include: [
                    {
                        model: associations_3.Socialworks,
                        where: { active: true },
                        attributes: ["name"],
                        required: true,
                    },
                ],
            });
        }
        // Paso 3: hacemos la consulta completa con los include definidos
        const UserAux = yield associations_1.Users.findByPk(id, { include });
        res.json(UserAux);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getUser = getUser;
const getActiveAttendants = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activeAttendants = yield associations_1.Users.findAll({
            where: { role: UserRole_1.UserRole.ATTENDANT, status: UserStatus_1.UserStatus.ACTIVE },
            include: [
                {
                    model: associations_2.AttendantXSocialworks,
                    include: [
                        {
                            model: associations_3.Socialworks,
                            where: { active: true }, // opcional: solo obras activas
                            attributes: ["name"], // solo traemos el nombre
                            required: true, // por si no tiene ninguna aún
                        },
                    ],
                    attributes: ["id"], // 👈 traé al menos un campo
                },
                {
                    model: associations_3.Socialworks,
                    where: { active: true }, // opcional: solo obras activas
                    attributes: ["name"], // solo traemos el nombre
                    required: false, // por si no tiene ninguna aún
                },
            ],
        });
        if (!activeAttendants) {
            return res
                .status(404)
                .json({ message: "No active attendants at the moment" });
        }
        return res.json(activeAttendants);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getActiveAttendants = getActiveAttendants;
const getInactiveAttendants = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inactiveAttendants = yield associations_1.Users.findAll({
            where: { role: UserRole_1.UserRole.ATTENDANT, status: UserStatus_1.UserStatus.INACTIVE },
        });
        if (!inactiveAttendants) {
            return res
                .status(404)
                .json({ message: "No inactive attendants at the moment" });
        }
        return res.json(inactiveAttendants);
    }
    catch (err) {
        return res.status(500).json({ message: err });
    }
});
exports.getInactiveAttendants = getInactiveAttendants;
const getAllAttendants = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allAttendants = yield associations_1.Users.findAll({
            where: { role: UserRole_1.UserRole.ATTENDANT },
        });
        if (!allAttendants) {
            return res.status(404).json({ message: "No attendants at the moment" });
        }
        return res.json(allAttendants);
    }
    catch (err) {
        return res.status(500).json({ message: err });
    }
});
exports.getAllAttendants = getAllAttendants;
const getUsersByAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userLogged = yield getUserLogged(req);
        if ((userLogged === null || userLogged === void 0 ? void 0 : userLogged.role) !== UserRole_1.UserRole.ADMIN) {
            return res
                .status(401)
                .json({ message: "No tiene autorización para acceder a estos datos" });
        }
        const { userRole, userStatus } = req.params;
        if (!userRole) {
            return res
                .status(400)
                .json({ message: "Faltan parametros en la petición" });
        }
        if (typeof userRole !== "string" ||
            (userStatus && typeof userStatus !== "string")) {
            return res.status(400).json({ message: "Parametros mal formulados" });
        }
        const where = { role: userRole };
        const include = [
            {
                model: associations_3.Socialworks, // relación directa (Users.socialworkID)
                where: { active: true },
                attributes: ["name"],
                required: false,
            },
        ];
        if (userStatus !== "Todos") {
            where.status = userStatus;
        }
        const users = yield associations_1.Users.findAll({
            where,
            include,
        });
        if (!users) {
            return res.status(404).json({ message: "No users found at the moment" });
        }
        return res.json(users);
    }
    catch (err) {
        return res.status(500).json({ message: err });
    }
});
exports.getUsersByAdmin = getUsersByAdmin;
const SetActiveAttendants = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user) {
            return res
                .status(401)
                .json({ message: "You're not allowed to see this information." });
        }
        if (user.role !== UserRole_1.UserRole.ADMIN) {
            return res
                .status(401)
                .json({ message: "You're not allowed to see this information." });
        }
        const { id } = req.params;
        if (!id) {
            return res
                .status(400)
                .json({ message: "Not all fields contains a value" });
        }
        const activeAttendant = yield associations_1.Users.findOne({
            where: { id: id, role: UserRole_1.UserRole.ATTENDANT, status: UserStatus_1.UserStatus.INACTIVE },
        });
        if (!activeAttendant) {
            return res
                .status(404)
                .json({ message: "No attendant matches this requirements" });
        }
        activeAttendant.set("status", UserStatus_1.UserStatus.ACTIVE);
        yield activeAttendant.save();
        return res.json({ message: "Attendant set to active" });
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.SetActiveAttendants = SetActiveAttendants;
const SetInactiveAttendants = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user) {
            return res
                .status(401)
                .json({ message: "You're not allowed to see this information." });
        }
        if (user.role !== UserRole_1.UserRole.ADMIN) {
            return res
                .status(401)
                .json({ message: "You're not allowed to see this information." });
        }
        const { id } = req.params;
        if (!id) {
            return res
                .status(400)
                .json({ message: "Not all fields contains a value" });
        }
        const activeAttendant = yield associations_1.Users.findOne({
            where: { id: id, role: UserRole_1.UserRole.ATTENDANT, status: UserStatus_1.UserStatus.ACTIVE },
        });
        if (!activeAttendant) {
            return res
                .status(404)
                .json({ message: "No attendant matches this requirements" });
        }
        activeAttendant.set("status", UserStatus_1.UserStatus.INACTIVE);
        yield activeAttendant.save();
        return res.json({ message: "Attendant set to inactive" });
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.SetInactiveAttendants = SetInactiveAttendants;
const getUserByName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield getUserLogged(req);
        if (!user) {
            return res
                .status(400)
                .json({ message: "You're not allowed to see this information." });
        }
        if (user.role === UserRole_1.UserRole.CLIENT) {
            return res
                .status(400)
                .json({ message: "You're not allowed to see this information." });
        }
        const { username } = req.params;
        const fullName = decodeURIComponent(username);
        const UserAux = yield associations_1.Users.findOne({ where: { fullName: fullName } });
        if (!UserAux) {
            return res.status(404).json({ message: "Error, User not found" });
        }
        return res.json(UserAux);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getUserByName = getUserByName;
const getAttendantsBySocialwork = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { socialworkID } = req.params;
        if (!socialworkID) {
            return res
                .status(400)
                .json({ message: "Not all fields contains a value" });
        }
        const attendants = yield associations_1.Users.findAll({
            where: { role: UserRole_1.UserRole.ATTENDANT, status: UserStatus_1.UserStatus.ACTIVE },
            include: [
                {
                    model: associations_2.AttendantXSocialworks,
                    where: { socialworkID: socialworkID },
                    include: [
                        {
                            model: associations_3.Socialworks,
                            where: { active: true }, // opcional: solo obras activas
                            attributes: ["name"], // solo traemos el nombre
                            required: true, // por si no tiene ninguna aún
                        },
                    ],
                },
            ],
        });
        if (!attendants) {
            return res.status(404).json({
                message: "No attendants at the moment with the current social work",
            });
        }
        return res.json(attendants);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getAttendantsBySocialwork = getAttendantsBySocialwork;
const getAdminUsersBySocialwork = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { socialworkID, userRole, userStatus } = req.params;
        if (!socialworkID || !userRole) {
            return res
                .status(400)
                .json({ message: "Not all fields contains a value" });
        }
        if (typeof socialworkID !== "string" || typeof userRole !== "string") {
            return res.status(400).json({ message: "Parametros mal formulados" });
        }
        const where = { role: userRole, socialworkID: socialworkID };
        if (userStatus !== "Todos") {
            where.status = userStatus;
        }
        const users = yield associations_1.Users.findAll({
            where,
            include: [
                {
                    model: associations_3.Socialworks,
                    attributes: ["name"],
                },
            ],
        });
        if (!users) {
            return res.status(404).json({
                message: "No users at the moment with the current social work",
            });
        }
        return res.json(users);
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.getAdminUsersBySocialwork = getAdminUsersBySocialwork;
const postUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const loggedUser = yield getUserLogged(req);
    if (loggedUser && loggedUser.role !== UserRole_1.UserRole.ADMIN) {
        return res
            .status(304)
            .json({ message: "Error, user is already logged in." });
    }
    try {
        let newUser = JSON.parse(req.body.body);
        if (!validateUser(newUser.fullName, newUser.email, newUser.password, newUser.phone, newUser.userID)) {
            return res
                .status(400)
                .json({ message: "No todos los campos contienen un valor" });
        }
        const passwordValidated = validatePassword(newUser.password);
        if (!passwordValidated.status) {
            return res.status(401).json({ message: passwordValidated.message });
        }
        const isRemoveBackground = req.body.removeBackground;
        let removeBackgroundFilter;
        if (isRemoveBackground) {
            removeBackgroundFilter = JSON.parse(isRemoveBackground);
        }
        let imageUrl;
        if (!loggedUser) {
            const file = req.file;
            if (!file) {
                return res.status(500).json({
                    message: "No puede dejar la foto de perfil vacía",
                });
            }
            let imageWithoutBg;
            if (removeBackgroundFilter) {
                imageWithoutBg = yield removeBackground(file);
                if (!imageWithoutBg) {
                    return res.status(500).json({
                        message: "Error removing background from the image",
                    });
                }
            }
            imageUrl = imageWithoutBg
                ? (0, exports.postImage)(imageWithoutBg, file.originalname)
                : (0, exports.postImage)(file);
        }
        else if (loggedUser && loggedUser.role === UserRole_1.UserRole.ADMIN) {
            imageUrl = "uploads/users/default.webp";
        }
        if (!imageUrl) {
            return res.status(500).json({
                message: "Error agregando foto de perfil, pongase en contacto con un administrador",
            });
        }
        let user = newUser;
        user.profileImage = imageUrl;
        yield associations_1.Users.create(user);
        return res.json({
            message: `User successfully created`,
        });
    }
    catch (err) {
        return res
            .status(401)
            .json({ message: "El email ya se encuentra registrado" });
    }
});
exports.postUser = postUser;
function validateUserByAdmin(status, role, speciality) {
    if (!role || !status) {
        return false;
    }
    if (typeof role !== "string" || typeof status !== "string") {
        return false;
    }
    if (role === UserRole_1.UserRole.ATTENDANT && !speciality) {
        return false;
    }
    return true;
}
const modifyUserByAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const loggedUser = yield getUserLogged(req);
    if (!loggedUser || loggedUser.role !== UserRole_1.UserRole.ADMIN) {
        return res
            .status(401)
            .json({ message: "No ha iniciado sesión o no tiene autorización" });
    }
    try {
        let newUser = JSON.parse(req.body.body);
        const validateUserAdminChange = validateUserByAdmin(newUser.status, newUser.role, newUser.speciality);
        if (!newUser.id || !validateUserAdminChange) {
            return res
                .status(400)
                .json({ message: "No todos los campos contienen un valor" });
        }
        let user = newUser;
        yield associations_1.Users.update({ status: user.status, role: user.role, speciality: user.speciality }, { where: { id: user.id } });
        return res.json({
            message: `User successfully modified`,
        });
    }
    catch (error) {
        return res.status(401).json({ message: error.message });
    }
});
exports.modifyUserByAdmin = modifyUserByAdmin;
const modifyUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const loggedUser = yield getUserLogged(req);
    if (!loggedUser) {
        return res.status(401).json({ message: "No ha iniciado sesión" });
    }
    try {
        let newUser = JSON.parse(req.body.body);
        if (!validateUser(newUser.fullName, newUser.email, newUser.password, newUser.phone, newUser.userID) ||
            !newUser.id) {
            return res
                .status(400)
                .json({ message: "No todos los campos contienen un valor" });
        }
        if (loggedUser.id !== newUser.id) {
            return res
                .status(401)
                .json({ message: "No puede modificar datos de otro usuario" });
        }
        const passwordValidated = validatePassword(newUser.password);
        if (!passwordValidated.status) {
            return res.status(401).json({ message: passwordValidated.message });
        }
        const file = req.file;
        if (!file && !newUser.profileImage) {
            return res
                .status(400)
                .json({ message: "No puede dejar la foto de perfil vacía" });
        }
        let user = newUser;
        if (file) {
            const isRemoveBackground = req.body.removeBackground;
            const imageUrl = yield uploadProfilePicture(file, isRemoveBackground);
            if (!imageUrl) {
                return res.status(500).json({
                    message: "Error agregando foto de perfil, pongase en contacto con un administrador",
                });
            }
            (0, exports.deleteImage)(newUser.profileImage);
            user.profileImage = imageUrl;
        }
        yield associations_1.Users.update({
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            userID: user.userID,
            profileImage: user.profileImage,
            status: user.status,
            role: user.role,
            speciality: user.speciality,
        }, { where: { id: user.id } });
        if (loggedUser.id === user.id) {
            createCookies(user, res);
        }
        return res.json({
            message: `User successfully modified`,
        });
    }
    catch (err) {
        return res.status(401).json({ message: err.message });
    }
});
exports.modifyUser = modifyUser;
function uploadProfilePicture(file, isRemoveBackground) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let removeBackgroundFilter;
            if (isRemoveBackground) {
                removeBackgroundFilter = JSON.parse(isRemoveBackground);
            }
            let imageUrl;
            let imageWithoutBg;
            if (removeBackgroundFilter) {
                imageWithoutBg = yield removeBackground(file);
                if (!imageWithoutBg) {
                    throw new Error("Error removing background from the image");
                }
            }
            imageUrl = imageWithoutBg
                ? (0, exports.postImage)(imageWithoutBg, file.originalname)
                : (0, exports.postImage)(file);
            return imageUrl;
        }
        catch (error) {
            throw new Error(error);
        }
    });
}
function validatePassword(password) {
    const regexMayuscula = /[A-Z]/;
    const regexNumero = /[0-9]/;
    if (password.length == 0) {
        return {
            message: "La contraseña no puede estar vacía",
            status: false,
        };
    }
    else {
        if (password.length < 8) {
            return {
                message: "La contraseña debe contener al menos 8 caracteres",
                status: false,
            };
        }
        else {
            if (!regexMayuscula.test(password)) {
                return {
                    message: "La contraseña debe contener al menos una mayuscula",
                    status: false,
                };
            }
            else {
                if (!regexNumero.test(password)) {
                    return {
                        message: "La contraseña debe contener al menos un numero",
                        status: false,
                    };
                }
            }
        }
    }
    return { message: "Validación correcta", status: true };
}
function validateUser(fullName, email, password, phone, userID) {
    if (!fullName || !email || !password || !phone || !userID) {
        return false;
    }
    return true;
}
const postImage = (file, originalName) => {
    if (!file)
        return undefined;
    const uniqueName = `${(0, uuid_1.v4)()}${path_1.default.extname(originalName || "image.png")}`;
    const uploadPath = path_1.default.join("uploads/users", uniqueName);
    // 🔹 Si `file` es un Buffer (imagen procesada), lo guarda como un archivo
    if (file instanceof Buffer) {
        fs_1.default.writeFileSync(uploadPath, file);
    }
    else {
        // 🔹 Si es un archivo Multer, guarda el buffer
        fs_1.default.writeFileSync(uploadPath, file.buffer);
    }
    return uploadPath;
};
exports.postImage = postImage;
const deleteImage = (imagePath) => {
    try {
        const fullPath = path_1.default.resolve(imagePath);
        if (fs_1.default.existsSync(fullPath)) {
            fs_1.default.unlinkSync(fullPath);
            return true;
        }
        return false;
    }
    catch (err) {
        console.error("Error deleting image:", err);
        return false;
    }
};
exports.deleteImage = deleteImage;
function removeBackground(file) {
    return __awaiter(this, void 0, void 0, function* () {
        const REMOVE_BG_API_KEY = "8h7vtT5EomgjNXiSFm4xQGWs";
        const formData = new form_data_1.default();
        formData.append("image_file", file.buffer, { filename: file.originalname });
        formData.append("size", "auto");
        try {
            const response = yield axios_1.default.post("https://api.remove.bg/v1.0/removebg", formData, {
                headers: Object.assign({ "X-Api-Key": REMOVE_BG_API_KEY }, formData.getHeaders()),
                responseType: "arraybuffer", // Devuelve la imagen en binario
            });
            return Buffer.from(response.data); // Retorna la imagen procesada como buffer
        }
        catch (error) {
            console.error("Error while removing background:", error);
            return null;
        }
    });
}
const recoverPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.params;
        if (!email) {
            return res.status(400).json("Not all fields contains a value");
        }
        const UserAux = yield associations_1.Users.scope("withAll").findOne({
            where: { email: email },
        });
        if (UserAux) {
            return res.json(UserAux);
        }
        else {
            return res.status(404).json({ message: "Error, User not found" });
        }
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.recoverPassword = recoverPassword;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json("Not all fields contains a value");
        }
        const userAux = yield loginCheck(email, password);
        if (userAux != null) {
            createCookies(userAux, res);
            return res.status(200).json({ message: "successfully logged in" });
        }
        else {
            return res
                .status(401)
                .json({ message: "El email o la contraseña es incorrecto" });
        }
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.login = login;
function createCookies(userValidated, res) {
    const access_token = jsonwebtoken_1.default.sign({
        id: userValidated.id,
        fullName: userValidated.fullName,
        email: userValidated.email,
        phone: userValidated.phone,
        userID: userValidated.userID,
        role: userValidated.role,
        status: userValidated.status,
        speciality: userValidated.speciality,
        profileImage: userValidated.profileImage,
        socialworkID: userValidated.socialworkID,
    }, config_1.SECRET_JWT_KEY, {
        expiresIn: "1h",
    });
    const refresh_token = jsonwebtoken_1.default.sign({
        id: userValidated.id,
        fullName: userValidated.fullName,
        email: userValidated.email,
        phone: userValidated.phone,
        userID: userValidated.userID,
        role: userValidated.role,
        status: userValidated.status,
        speciality: userValidated.speciality,
        profileImage: userValidated.profileImage,
        socialworkID: userValidated.socialworkID,
    }, config_1.SECRET_JWT_KEY, {
        expiresIn: "1d",
    });
    res.cookie("access_token", access_token, {
        path: "/",
        httpOnly: true,
        secure: true, ///process.env.NODE_ENV == 'production',
        sameSite: "none",
        domain: ".localhost", // Comparte la cookie entre www.localhost.com y api.localhost.com
        ///domain: '.distribucionlosvascos.com', // Comparte la cookie entre www.localhost.com y api.localhost.com
        maxAge: 1000 * 60 * 60,
    });
    res.cookie("refresh_token", refresh_token, {
        path: "/",
        httpOnly: true,
        secure: true, ///process.env.NODE_ENV == 'production',
        sameSite: "none",
        domain: ".localhost", // Comparte la cookie entre www.localhost.com y api.localhost.com
        ///domain: '.distribucionlosvascos.com', // Comparte la cookie entre www.localhost.com y api.localhost.com
        maxAge: 1000 * 60 * 60 * 24,
    });
}
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.access_token;
        if (token) {
            res.cookie("refresh_token", "", {
                path: "/",
                httpOnly: true,
                secure: true, ///process.env.NODE_ENV == 'production',
                sameSite: "none",
                domain: ".localhost", // Comparte la cookie entre www.localhost.com y api.localhost.com
                ///domain: '.distribucionlosvascos.com', // Comparte la cookie entre www.localhost.com y api.localhost.com
                maxAge: 0,
            });
            res.cookie("access_token", "", {
                path: "/",
                httpOnly: true,
                secure: true, ///process.env.NODE_ENV == 'production',
                sameSite: "none",
                domain: ".localhost", // Comparte la cookie entre www.localhost.com y api.localhost.com
                ///domain: '.distribucionlosvascos.com', // Comparte la cookie entre www.localhost.com y api.localhost.com
                maxAge: 0,
            });
            return res.send("finish");
        }
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
});
exports.logout = logout;
const validatePasswordModal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const loggedUser = yield getUserLogged(req);
    if (!loggedUser) {
        return res.json(false);
    }
    const { password } = req.body;
    if (!password) {
        return res.json(false);
    }
    try {
        const userAux = yield associations_1.Users.scope("withAll").findByPk(loggedUser.id);
        if (!userAux) {
            return res.json(false);
        }
        const userPass = userAux.getDataValue("password");
        if (password !== userPass) {
            return res.json(false);
        }
        return res.json(true);
    }
    catch (error) {
        return res.status(500).json(error);
    }
});
exports.validatePasswordModal = validatePasswordModal;
function loginCheck(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield associations_1.Users.scope("withAll").findOne({
                where: { email: email, status: "active" },
            });
            let userAux = new Users_1.User("", "", "", "", "", "", UserRole_1.UserRole.CLIENT, UserStatus_1.UserStatus.ACTIVE, "", "");
            if (user != null) {
                userAux = user.toJSON();
                let access = password === userAux.password; //await bcrypt.compare(password, userAux.password);
                if (access) {
                    return userAux;
                }
                else {
                    return null;
                }
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
function getUserLogged(req) {
    return __awaiter(this, void 0, void 0, function* () {
        let access = req.cookies["access_token"];
        let user = new Users_1.User("", "", "", "", "", "", UserRole_1.UserRole.CLIENT, UserStatus_1.UserStatus.ACTIVE, "", "");
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
        let user = new Users_1.User("", "", "", "", "", "", UserRole_1.UserRole.CLIENT, UserStatus_1.UserStatus.ACTIVE, "", "");
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
