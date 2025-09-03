import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { SECRET_JWT_KEY } from "../models/config";
import { UserRole } from "../models/enums/UserRole";
import { UserStatus } from "../models/enums/UserStatus";
import { AttendantXSocialworks } from "../models/mysql/associations";
import { User } from "../models/Users";

export const postAttendantXSocialwork = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);

    if (!user) {
      return res
        .status(401)
        .json({ message: "No tiene permiso para ver esta información" });
    }

    if (user.role !== UserRole.ATTENDANT) {
      return res
        .status(401)
        .json({ message: "No tiene permiso para ver esta información" });
    }

    const body = req.body;

    if (
      !body.attendantID ||
      !body.socialworkID ||
      !body.id ||
      typeof body.attendantID !== "string" ||
      typeof body.socialworkID !== "string" ||
      typeof body.id !== "string"
    ) {
      return res.status(400).json({ message: "Error en la carga de datos" });
    }

    const attendantXsocialwork = {
      id: body.id,
      attendantID: body.attendantID,
      socialworkID: body.socialworkID,
    };

    await AttendantXSocialworks.create(attendantXsocialwork);

    return res
      .status(200)
      .json({ message: "Cobertura médica del doctor cargada correctamente" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const deleteAttendantXSocialwork = async (
  req: Request,
  res: Response
) => {
  try {
    const user = await getUserLogged(req);

    if (!user) {
      return res
        .status(401)
        .json({ message: "No tiene permiso para ver esta información" });
    }

    if (user.role !== UserRole.ATTENDANT) {
      return res
        .status(401)
        .json({ message: "No tiene permiso para ver esta información" });
    }

    const { attendantID, socialworkID } = req.params;

    if (
      !attendantID ||
      !socialworkID ||
      typeof attendantID !== "string" ||
      typeof socialworkID !== "string"
    ) {
      return res
        .status(400)
        .json({ message: "No todos los campos contienen un valor" });
    }

    const attendantXSocialworkToDelete = await AttendantXSocialworks.findOne({
      where: { attendantID: attendantID, socialworkID: socialworkID },
    });

    if (!attendantXSocialworkToDelete) {
      return res.status(404).json({
        message: "No se encontró esta información",
      });
    }

    await attendantXSocialworkToDelete.destroy();
    return res
      .status(200)
      .json({ message: "Información borrada correctamente" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

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
