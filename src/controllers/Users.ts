import { Request, Response } from "express";
import { Users } from "../models/mysql/associations";
import { User } from "../models/Users";
import { UserRole } from "../models/enums/UserRole";
import { UserStatus } from "../models/enums/UserStatus";
import jwt from "jsonwebtoken";
import { DOMAIN, SECRET_JWT_KEY } from "../models/config";
import path from "path";
import { v4 as UUIDV4 } from "uuid";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import { AttendantXSocialworks } from "../models/mysql/associations";
import { Socialworks } from "../models/mysql/associations";

export const getUser = async (req: Request, res: Response) => {
  try {
    const userAux = await getUserLogged(req);
    if (userAux) {
      return res
        .status(401)
        .json({ message: "You are not allowed to enter here." });
    }
    const { id } = req.params;
    // Paso 1: obtenemos el usuario sin relaciones para saber su rol
    const user = await Users.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Paso 2: armamos el include según su rol
    const include: any[] = [
      {
        model: Socialworks, // relación directa (Users.socialworkID)
        where: { active: true },
        attributes: ["name"],
        required: false,
      },
    ];

    // Solo agregamos el include de AttendantXSocialworks si el rol es 'attendant'
    if (user.getDataValue("role") === UserRole.ATTENDANT) {
      include.push({
        model: AttendantXSocialworks,
        attributes: ["id"],
        include: [
          {
            model: Socialworks,
            where: { active: true },
            attributes: ["name"],
            required: true,
          },
        ],
      });
    }

    // Paso 3: hacemos la consulta completa con los include definidos
    const UserAux = await Users.findByPk(id, { include });
    res.json(UserAux);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getActiveAttendants = async (req: Request, res: Response) => {
  try {
    const activeAttendants = await Users.findAll({
      where: { role: UserRole.ATTENDANT, status: UserStatus.ACTIVE },
      include: [
        {
          model: AttendantXSocialworks,
          include: [
            {
              model: Socialworks,
              where: { active: true }, // opcional: solo obras activas
              attributes: ["name"], // solo traemos el nombre
              required: true, // por si no tiene ninguna aún
            },
          ],
          attributes: ["id"], // 👈 traé al menos un campo
        },
        {
          model: Socialworks,
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
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getInactiveAttendants = async (req: Request, res: Response) => {
  try {
    const inactiveAttendants = await Users.findAll({
      where: { role: UserRole.ATTENDANT, status: UserStatus.INACTIVE },
    });

    if (!inactiveAttendants) {
      return res
        .status(404)
        .json({ message: "No inactive attendants at the moment" });
    }

    return res.json(inactiveAttendants);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

export const getAllAttendants = async (req: Request, res: Response) => {
  try {
    const allAttendants = await Users.findAll({
      where: { role: UserRole.ATTENDANT },
    });

    if (!allAttendants) {
      return res.status(404).json({ message: "No attendants at the moment" });
    }

    return res.json(allAttendants);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

export const getUsersByAdmin = async (req: Request, res: Response) => {
  try {
    const userLogged = await getUserLogged(req);
    if (userLogged?.role !== UserRole.ADMIN) {
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

    if (
      typeof userRole !== "string" ||
      (userStatus && typeof userStatus !== "string")
    ) {
      return res.status(400).json({ message: "Parametros mal formulados" });
    }

    const where: any = { role: userRole };
    const include: any[] = [
      {
        model: Socialworks, // relación directa (Users.socialworkID)
        where: { active: true },
        attributes: ["name"],
        required: false,
      },
    ];

    if (userStatus !== "Todos") {
      where.status = userStatus;
    }

    const users = await Users.findAll({
      where,
      include,
    });

    if (!users) {
      return res.status(404).json({ message: "No users found at the moment" });
    }

    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

export const SetActiveAttendants = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);

    if (!user) {
      return res
        .status(401)
        .json({ message: "You're not allowed to see this information." });
    }

    if (user.role !== UserRole.ADMIN) {
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

    const activeAttendant = await Users.findOne({
      where: { id: id, role: UserRole.ATTENDANT, status: UserStatus.INACTIVE },
    });

    if (!activeAttendant) {
      return res
        .status(404)
        .json({ message: "No attendant matches this requirements" });
    }

    activeAttendant.set("status", UserStatus.ACTIVE);
    await activeAttendant.save();
    return res.json({ message: "Attendant set to active" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const SetInactiveAttendants = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);

    if (!user) {
      return res
        .status(401)
        .json({ message: "You're not allowed to see this information." });
    }

    if (user.role !== UserRole.ADMIN) {
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

    const activeAttendant = await Users.findOne({
      where: { id: id, role: UserRole.ATTENDANT, status: UserStatus.ACTIVE },
    });

    if (!activeAttendant) {
      return res
        .status(404)
        .json({ message: "No attendant matches this requirements" });
    }

    activeAttendant.set("status", UserStatus.INACTIVE);
    await activeAttendant.save();
    return res.json({ message: "Attendant set to inactive" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getUserByName = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);

    if (!user) {
      return res
        .status(400)
        .json({ message: "You're not allowed to see this information." });
    }

    if (user.role === UserRole.CLIENT) {
      return res
        .status(400)
        .json({ message: "You're not allowed to see this information." });
    }

    const { username } = req.params;
    const fullName = decodeURIComponent(username);
    const UserAux = await Users.findOne({ where: { fullName: fullName } });

    if (!UserAux) {
      return res.status(404).json({ message: "Error, User not found" });
    }

    return res.json(UserAux);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getAttendantsBySocialwork = async (
  req: Request,
  res: Response
) => {
  try {
    const { socialworkID } = req.params;

    if (!socialworkID) {
      return res
        .status(400)
        .json({ message: "Not all fields contains a value" });
    }

    const attendants = await Users.findAll({
      where: { role: UserRole.ATTENDANT, status: UserStatus.ACTIVE },
      include: [
        {
          model: AttendantXSocialworks,
          where: { socialworkID: socialworkID },
          include: [
            {
              model: Socialworks,
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
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getAdminUsersBySocialwork = async (
  req: Request,
  res: Response
) => {
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

    const where: any = { role: userRole, socialworkID: socialworkID };
    if (userStatus !== "Todos") {
      where.status = userStatus;
    }

    const users = await Users.findAll({
      where,
      include: [
        {
          model: Socialworks,
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
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const postUser = async (req: Request, res: Response) => {
  const loggedUser = await getUserLogged(req);
  if (loggedUser && loggedUser.role !== UserRole.ADMIN) {
    return res
      .status(304)
      .json({ message: "Error, user is already logged in." });
  }
  try {
    let newUser = JSON.parse(req.body.body);

    if (
      !validateUser(
        newUser.fullName,
        newUser.email,
        newUser.password,
        newUser.phone,
        newUser.userID
      )
    ) {
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

    let imageUrl: string | undefined;

    if (!loggedUser) {
      const file = req.file;

      if (!file) {
        return res.status(500).json({
          message: "No puede dejar la foto de perfil vacía",
        });
      }

      let imageWithoutBg;
      if (removeBackgroundFilter) {
        imageWithoutBg = await removeBackground(file);

        if (!imageWithoutBg) {
          return res.status(500).json({
            message: "Error removing background from the image",
          });
        }
      }
      imageUrl = imageWithoutBg
        ? postImage(imageWithoutBg, file.originalname)
        : postImage(file);
    } else if (loggedUser && loggedUser.role === UserRole.ADMIN) {
      imageUrl = "uploads/users/default.webp";
    }
    if (!imageUrl) {
      return res.status(500).json({
        message:
          "Error agregando foto de perfil, pongase en contacto con un administrador",
      });
    }
    let user = newUser;
    user.profileImage = imageUrl;

    await Users.create(user);
    return res.json({
      message: `User successfully created`,
    });
  } catch (err: any) {
    return res
      .status(401)
      .json({ message: "El email ya se encuentra registrado" });
  }
};

function validateUserByAdmin(
  status: string,
  role: string,
  speciality?: string
) {
  if (!role || !status) {
    return false;
  }
  if (typeof role !== "string" || typeof status !== "string") {
    return false;
  }
  if (role === UserRole.ATTENDANT && !speciality) {
    return false;
  }
  return true;
}

export const modifyUserByAdmin = async (req: Request, res: Response) => {
  const loggedUser = await getUserLogged(req);
  if (!loggedUser || loggedUser.role !== UserRole.ADMIN) {
    return res
      .status(401)
      .json({ message: "No ha iniciado sesión o no tiene autorización" });
  }
  try {
    let newUser = JSON.parse(req.body.body);

    const validateUserAdminChange = validateUserByAdmin(
      newUser.status,
      newUser.role,
      newUser.speciality
    );

    if (!newUser.id || !validateUserAdminChange) {
      return res
        .status(400)
        .json({ message: "No todos los campos contienen un valor" });
    }

    let user = newUser;

    await Users.update(
      { status: user.status, role: user.role, speciality: user.speciality },
      { where: { id: user.id } }
    );

    return res.json({
      message: `User successfully modified`,
    });
  } catch (error: any) {
    return res.status(401).json({ message: error.message });
  }
};

export const modifyUser = async (req: Request, res: Response) => {
  const loggedUser = await getUserLogged(req);
  if (!loggedUser) {
    return res.status(401).json({ message: "No ha iniciado sesión" });
  }

  try {
    let newUser = JSON.parse(req.body.body);

    if (
      !validateUser(
        newUser.fullName,
        newUser.email,
        newUser.password,
        newUser.phone,
        newUser.userID
      ) ||
      !newUser.id
    ) {
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

      const imageUrl = await uploadProfilePicture(file, isRemoveBackground);

      if (!imageUrl) {
        return res.status(500).json({
          message:
            "Error agregando foto de perfil, pongase en contacto con un administrador",
        });
      }
      deleteImage(newUser.profileImage);
      user.profileImage = imageUrl;
    }

    await Users.update(
      {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        userID: user.userID,
        profileImage: user.profileImage,
        status: user.status,
        role: user.role,
        speciality: user.speciality,
      },
      { where: { id: user.id } }
    );

    if (loggedUser.id === user.id) {
      createCookies(user, res);
    }

    return res.json({
      message: `User successfully modified`,
    });
  } catch (err: any) {
    return res.status(401).json({ message: err.message });
  }
};

async function uploadProfilePicture(
  file: Express.Multer.File,
  isRemoveBackground: any
) {
  try {
    let removeBackgroundFilter;
    if (isRemoveBackground) {
      removeBackgroundFilter = JSON.parse(isRemoveBackground);
    }

    let imageUrl: string | undefined;

    let imageWithoutBg;
    if (removeBackgroundFilter) {
      imageWithoutBg = await removeBackground(file);

      if (!imageWithoutBg) {
        throw new Error("Error removing background from the image");
      }
    }
    imageUrl = imageWithoutBg
      ? postImage(imageWithoutBg, file.originalname)
      : postImage(file);

    return imageUrl;
  } catch (error: any) {
    throw new Error(error);
  }
}

function validatePassword(password: string) {
  const regexMayuscula = /[A-Z]/;
  const regexNumero = /[0-9]/;
  if (password.length == 0) {
    return {
      message: "La contraseña no puede estar vacía",
      status: false,
    };
  } else {
    if (password.length < 8) {
      return {
        message: "La contraseña debe contener al menos 8 caracteres",
        status: false,
      };
    } else {
      if (!regexMayuscula.test(password)) {
        return {
          message: "La contraseña debe contener al menos una mayuscula",
          status: false,
        };
      } else {
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

function validateUser(
  fullName: string,
  email: string,
  password: string,
  phone: string,
  userID: string
) {
  if (!fullName || !email || !password || !phone || !userID) {
    return false;
  }
  return true;
}

export const postImage = (
  file: Express.Multer.File | Buffer,
  originalName?: string
): string | undefined => {
  if (!file) return undefined;

  const uniqueName = `${UUIDV4()}${path.extname(originalName || "image.png")}`;
  const uploadPath = path.join("uploads/users", uniqueName);

  // 🔹 Si `file` es un Buffer (imagen procesada), lo guarda como un archivo
  if (file instanceof Buffer) {
    fs.writeFileSync(uploadPath, file as NodeJS.ArrayBufferView);
  } else {
    // 🔹 Si es un archivo Multer, guarda el buffer
    fs.writeFileSync(uploadPath, file.buffer as NodeJS.ArrayBufferView);
  }

  return uploadPath;
};

export const deleteImage = (imagePath: string): boolean => {
  try {
    const fullPath = path.resolve(imagePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }

    return false;
  } catch (err) {
    console.error("Error deleting image:", err);
    return false;
  }
};

async function removeBackground(
  file: Express.Multer.File
): Promise<Buffer | null> {
  const REMOVE_BG_API_KEY = "8h7vtT5EomgjNXiSFm4xQGWs";
  const formData = new FormData();
  formData.append("image_file", file.buffer, { filename: file.originalname });
  formData.append("size", "auto");

  try {
    const response = await axios.post(
      "https://api.remove.bg/v1.0/removebg",
      formData,
      {
        headers: {
          "X-Api-Key": REMOVE_BG_API_KEY,
          ...formData.getHeaders(),
        },
        responseType: "arraybuffer", // Devuelve la imagen en binario
      }
    );

    return Buffer.from(response.data); // Retorna la imagen procesada como buffer
  } catch (error) {
    console.error("Error while removing background:", error);
    return null;
  }
}

export const recoverPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json("Not all fields contains a value");
    }
    const UserAux = await Users.scope("withAll").findOne({
      where: { email: email },
    });
    if (UserAux) {
      return res.json(UserAux);
    } else {
      return res.status(404).json({ message: "Error, User not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json("Not all fields contains a value");
    }

    const userAux = await loginCheck(email, password);

    if (userAux != null) {
      createCookies(userAux, res);
      return res.status(200).json({ message: "successfully logged in" });
    } else {
      return res
        .status(401)
        .json({ message: "El email o la contraseña es incorrecto" });
    }
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

function createCookies(userValidated: User, res: Response) {
  const access_token = jwt.sign(
    {
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
    },
    SECRET_JWT_KEY,
    {
      expiresIn: "1h",
    }
  );

  const refresh_token = jwt.sign(
    {
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
    },
    SECRET_JWT_KEY,
    {
      expiresIn: "1d",
    }
  );

  res.cookie("access_token", access_token, {
    path: "/",
    httpOnly: true,
    secure: true, ///process.env.NODE_ENV == 'production',
    sameSite: "none",
    domain: DOMAIN,
    maxAge: 1000 * 60 * 60,
  });

  res.cookie("refresh_token", refresh_token, {
    path: "/",
    httpOnly: true,
    secure: true, ///process.env.NODE_ENV == 'production',
    sameSite: "none",
    domain: DOMAIN,
    maxAge: 1000 * 60 * 60 * 24,
  });
}

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.access_token;

    if (token) {
      res.cookie("refresh_token", "", {
        path: "/",
        httpOnly: true,
        secure: true, ///process.env.NODE_ENV == 'production',
        sameSite: "none",
        domain: DOMAIN,
        maxAge: 0,
      });

      res.cookie("access_token", "", {
        path: "/",
        httpOnly: true,
        secure: true, ///process.env.NODE_ENV == 'production',
        sameSite: "none",
        domain: DOMAIN,
        maxAge: 0,
      });
      return res.send("finish");
    }
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const validatePasswordModal = async (req: Request, res: Response) => {
  const loggedUser = await getUserLogged(req);
  if (!loggedUser) {
    return res.json(false);
  }

  const { password } = req.body;

  if (!password) {
    return res.json(false);
  }

  try {
    const userAux = await Users.scope("withAll").findByPk(loggedUser.id);
    if (!userAux) {
      return res.json(false);
    }
    const userPass = userAux.getDataValue("password");

    if (password !== userPass) {
      return res.json(false);
    }

    return res.json(true);
  } catch (error) {
    return res.status(500).json(error);
  }
};

async function loginCheck(email: string, password: string) {
  try {
    const user = await Users.scope("withAll").findOne({
      where: { email: email, status: "active" },
    });
    let userAux: User = new User(
      "",
      "",
      "",
      "",
      "",
      "",
      UserRole.CLIENT,
      UserStatus.ACTIVE,
      "",
      ""
    );
    if (user != null) {
      userAux = user.toJSON() as User;
      let access = password === userAux.password; //await bcrypt.compare(password, userAux.password);
      if (access) {
        return userAux;
      } else {
        return null;
      }
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

async function getUserLogged(req: Request) {
  let access = req.cookies["access_token"];
  let user: User = new User(
    "",
    "",
    "",
    "",
    "",
    "",
    UserRole.CLIENT,
    UserStatus.ACTIVE,
    "",
    ""
  );
  if (access) {
    let userAux = await getToken(access);
    if (userAux) {
      user = userAux;
    }
    return user;
  }
  return undefined;
}

async function getToken(tokenAux: any) {
  let user: User = new User(
    "",
    "",
    "",
    "",
    "",
    "",
    UserRole.CLIENT,
    UserStatus.ACTIVE,
    "",
    ""
  );
  try {
    const data = jwt.verify(tokenAux, SECRET_JWT_KEY);
    if (typeof data === "object" && data !== null) {
      user = data as User; // Casting si estás seguro que data contiene propiedades de User
      return user;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}
