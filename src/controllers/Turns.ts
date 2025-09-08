import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { SECRET_JWT_KEY } from "../models/config";
import { UserRole } from "../models/enums/UserRole";
import { UserStatus } from "../models/enums/UserStatus";
import Socialworks from "../models/mysql/Socialworks";
import Turns from "../models/mysql/Turns";
import Users from "../models/mysql/Users";
import { User } from "../models/Users";
import { isAttendantAvailable } from "./Availability";

export const getAllUserTurns = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);

    if (!user) {
      return res
        .status(401)
        .json({ message: "No tiene permiso para ver esta información" });
    }

    const turns = await Turns.findAll({
      where: { userID: user.id },
      order: [["date", "DESC"]],
      include: [
        {
          model: Users,
          as: "User", // ← cliente
          attributes: ["fullName", "userID"],
          include: [
            {
              model: Socialworks,
              attributes: ["name"],
            },
          ],
        },
        {
          model: Users,
          as: "Attendant", // ← médico
          attributes: ["id", "fullName", "profileImage", "userID"],
        },
      ],
    });

    if (!turns) {
      return res.status(404).json({ message: "No se encontraron turnos" });
    }

    return res.status(200).json(turns);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getScheduledUserTurns = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);

    if (!user) {
      return res
        .status(401)
        .json({ message: "No tiene permiso para ver esta información" });
    }

    const turns = await Turns.findAll({
      where: { userID: user.id, status: "scheduled" },
      order: [["date", "DESC"]],
      include: [
        {
          model: Users,
          as: "User", // ← cliente
          attributes: ["fullName", "userID"],
          include: [
            {
              model: Socialworks,
              attributes: ["name"],
            },
          ],
        },
        {
          model: Users,
          as: "Attendant", // ← médico
          attributes: ["id", "fullName", "profileImage", "userID"],
        },
      ],
    });

    if (!turns) {
      return res.status(404).json({ message: "No se encontraron turnos" });
    }

    return res.json(turns);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getCompletedUserTurns = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);

    if (!user) {
      return res
        .status(401)
        .json({ message: "No tiene permiso para ver esta información" });
    }

    const turns = await Turns.findAll({
      where: { userID: user.id, status: "completed" },
      order: [["date", "DESC"]],
      include: [
        {
          model: Users,
          as: "User", // ← cliente
          attributes: ["fullName", "userID"],
          include: [
            {
              model: Socialworks,
              attributes: ["name"],
            },
          ],
        },
        {
          model: Users,
          as: "Attendant", // ← médico
          attributes: ["id", "fullName", "profileImage", "userID"],
        },
      ],
    });

    if (!turns) {
      return res.status(404).json({ message: "No se encontraron turnos" });
    }

    return res.json(turns);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getCanceledUserTurns = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);

    if (!user) {
      return res
        .status(401)
        .json({ message: "No tiene permiso para ver esta información" });
    }

    const turns = await Turns.findAll({
      where: { userID: user.id, status: "canceled" },
      order: [["date", "DESC"]],
      include: [
        {
          model: Users,
          as: "User", // ← cliente
          attributes: ["fullName", "userID"],
          include: [
            {
              model: Socialworks,
              attributes: ["name"],
            },
          ],
        },
        {
          model: Users,
          as: "Attendant", // ← médico
          attributes: ["id", "fullName", "profileImage", "userID"],
        },
      ],
    });

    if (!turns) {
      return res.status(404).json({ message: "No se encontraron turnos" });
    }

    return res.json(turns);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getNotScheduledUserTurns = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);

    if (!user) {
      return res
        .status(401)
        .json({ message: "No tiene permiso para ver esta información" });
    }

    const turns = await Turns.findAll({
      where: {
        userID: user.id,
        status: { [Op.or]: ["completed", "canceled"] },
      },
      order: [["date", "DESC"]],
      include: [
        {
          model: Users,
          as: "User", // ← cliente
          attributes: ["fullName", "userID"],
          include: [
            {
              model: Socialworks,
              attributes: ["name"],
            },
          ],
        },
        {
          model: Users,
          as: "Attendant", // ← médico
          attributes: ["id", "fullName", "profileImage", "userID"],
        },
      ],
    });

    if (!turns) {
      return res.status(404).json({ message: "No se encontraron turnos" });
    }

    return res.json(turns);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getScheduledAdminTurns = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);

    if (!user || user.role !== UserRole.ADMIN) {
      return res
        .status(401)
        .json({ message: "No tiene permiso para ver esta información" });
    }

    const turns = await Turns.findAll({
      where: { status: "scheduled" },
      order: [["date", "DESC"]],
      include: [
        {
          model: Users,
          as: "User", // ← cliente
          attributes: ["fullName", "userID"],
          include: [
            {
              model: Socialworks,
              attributes: ["name"],
            },
          ],
        },
        {
          model: Users,
          as: "Attendant", // ← médico
          attributes: ["id", "fullName", "profileImage", "userID"],
        },
      ],
    });

    if (!turns) {
      return res.status(404).json({ message: "No se encontraron turnos" });
    }

    return res.json(turns);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getCompletedAdminTurns = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);

    if (!user || user.role !== UserRole.ADMIN) {
      return res
        .status(401)
        .json({ message: "No tiene permiso para ver esta información" });
    }

    const turns = await Turns.findAll({
      where: { status: "completed" },
      order: [["date", "DESC"]],
      include: [
        {
          model: Users,
          as: "User", // ← cliente
          attributes: ["fullName", "userID"],
          include: [
            {
              model: Socialworks,
              attributes: ["name"],
            },
          ],
        },
        {
          model: Users,
          as: "Attendant", // ← médico
          attributes: ["id", "fullName", "profileImage", "userID"],
        },
      ],
    });

    if (!turns) {
      return res.status(404).json({ message: "No se encontraron turnos" });
    }

    return res.json(turns);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getCanceledAdminTurns = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);

    if (!user || user.role !== UserRole.ADMIN) {
      return res
        .status(401)
        .json({ message: "No tiene permiso para ver esta información" });
    }

    const turns = await Turns.findAll({
      where: { status: "canceled" },
      order: [["date", "DESC"]],
      include: [
        {
          model: Users,
          as: "User", // ← cliente
          attributes: ["fullName", "userID"],
          include: [
            {
              model: Socialworks,
              attributes: ["name"],
            },
          ],
        },
        {
          model: Users,
          as: "Attendant", // ← médico
          attributes: ["id", "fullName", "profileImage", "userID"],
        },
      ],
    });

    if (!turns) {
      return res.status(404).json({ message: "No se encontraron turnos" });
    }

    return res.json(turns);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getAllAttendantTurns = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);

    if (!user) {
      return res
        .status(401)
        .json({ message: "No tiene permiso para ver esta información" });
    }

    const turns = await Turns.findAll({
      where: { attendantID: user.id },
      order: [["date", "DESC"]],
      include: [
        {
          model: Users,
          as: "User", // ← cliente
          attributes: ["fullName", "userID"],
          include: [
            {
              model: Socialworks,
              attributes: ["name"],
            },
          ],
        },
        {
          model: Users,
          as: "Attendant", // ← médico
          attributes: ["id", "fullName", "profileImage", "userID"],
        },
      ],
    });

    if (!turns) {
      return res.status(404).json({ message: "No se encontraron turnos" });
    }

    return res.json(turns);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

function hasAvailableHour(startHour: number, endHour: number, turns: any) {
  const availableHours: number[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    availableHours.push(hour);
  }

  for (const turn of turns) {
    const turnHour = new Date(turn.date).getHours();
    const index = availableHours.indexOf(turnHour);
    if (index !== -1) {
      availableHours.splice(index, 1);
    }
  }

  const formattedHours = availableHours.map(
    (hour) => `${hour.toString().padStart(2, "0")}:00`
  );

  return formattedHours; // Si queda alguna hora libre, hay disponibilidad
}

function validateParametersAvailability(
  startHour: any,
  endHour: any,
  date: any
) {
  if (
    typeof startHour !== "number" ||
    typeof endHour !== "number" ||
    !(date instanceof Date)
  ) {
    return false;
  }
  return true;
}

export const getAttendantTurnsByDate = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);

    if (!user) {
      return res
        .status(401)
        .json({ message: "No tiene permiso para ver esta información" });
    }

    const { attendantID } = req.params;
    let { startHour, endHour, date } = req.body;

    date = new Date(date);

    if (!attendantID || !startHour || !endHour || !date) {
      return res.status(400).json({ message: "Faltan datos en la petición" });
    }
    if (!validateParametersAvailability(startHour, endHour, date)) {
      return res
        .status(400)
        .json({ message: "Datos incorrectos en la petición" });
    }

    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const turns = await Turns.findAll({
      where: {
        attendantID: attendantID,
        date: { [Op.between]: [startOfDay, endOfDay] },
        status: "scheduled",
      },
      order: [["date", "DESC"]],
    });

    if (!turns) {
      return res.status(404).json({ message: "No se encontraron turnos" });
    }

    const availableHours = hasAvailableHour(startHour, endHour, turns);
    return res
      .status(200)
      .json({ isValid: availableHours.length > 0, hours: availableHours });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getScheduledAttendantTurns = async (
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

    const turns = await Turns.findAll({
      where: { attendantID: user.id, status: "scheduled" },
      order: [["date", "DESC"]],
      include: [
        {
          model: Users,
          as: "User", // ← cliente
          attributes: ["fullName", "userID"],
          include: [
            {
              model: Socialworks,
              attributes: ["name"],
            },
          ],
        },
        {
          model: Users,
          as: "Attendant", // ← médico
          attributes: ["id", "fullName", "userID"],
        },
      ],
    });

    if (!turns) {
      return res.status(404).json({ message: "No se encontraron turnos" });
    }

    return res.json(turns);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getCompletedAttendantTurns = async (
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

    const turns = await Turns.findAll({
      where: { attendantID: user.id, status: "completed" },
      order: [["date", "DESC"]],
      include: [
        {
          model: Users,
          as: "User", // ← cliente
          attributes: ["fullName", "userID"],
          include: [
            {
              model: Socialworks,
              attributes: ["name"],
            },
          ],
        },
        {
          model: Users,
          as: "Attendant", // ← médico
          attributes: ["id", "fullName", "userID"],
        },
      ],
    });

    if (!turns) {
      return res.status(404).json({ message: "No se encontraron turnos" });
    }

    return res.json(turns);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getCanceledAttendantTurns = async (
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

    const turns = await Turns.findAll({
      where: { attendantID: user.id, status: "canceled" },
      order: [["date", "DESC"]],
      include: [
        {
          model: Users,
          as: "User", // ← cliente
          attributes: ["fullName", "userID"],
          include: [
            {
              model: Socialworks,
              attributes: ["name"],
            },
          ],
        },
        {
          model: Users,
          as: "Attendant", // ← médico
          attributes: ["id", "fullName", "userID"],
        },
      ],
    });

    if (!turns) {
      return res.status(404).json({ message: "No se encontraron turnos" });
    }

    return res.json(turns);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const createTurn = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);

    if (!user) {
      return res
        .status(401)
        .json({ message: "No tiene permiso para ver esta información" });
    }

    let { attendantID, date, place, comments } = req.body;

    if (!validateTurn(attendantID, date, place)) {
      return res
        .status(400)
        .json({ message: "No todos los campos contienen un valor" });
    }

    const userID = user.id;

    const isAvailable = await isAttendantAvailable(attendantID, date);

    if (!isAvailable?.available) {
      return res
        .status(401)
        .json({ message: isAvailable?.message || "Not available" });
    }

    const turns = { date, place, userID, attendantID, comments };

    await Turns.create(turns);
    return res.status(200).json("Turno creado con exito");
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const attendantCreateTurn = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);

    if (!user) {
      return res
        .status(401)
        .json({ message: "No tiene permiso para ver esta información" });
    }

    let { userID, date, place, comments } = req.body;

    if (!validateTurn(userID, date, place)) {
      return res
        .status(400)
        .json({ message: "No todos los campos contienen un valor" });
    }

    const attendantID = user.id;

    const isAvailable = await isAttendantAvailable(attendantID, date);

    if (!isAvailable?.available) {
      return res.status(304).json(isAvailable?.message || "Not available");
    }

    const turns = { date, place, userID, attendantID, comments };
    await Turns.create(turns);
    return res.status(200).json("Turno creado con exito");
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

function validateTurn(attendantID: string, date: any, place: string) {
  if (!attendantID || !date || !place) {
    return false;
  }

  if (typeof attendantID !== "string" || typeof place !== "string") {
    return false;
  }

  const parsedDate = new Date(date);
  const isValidDate =
    parsedDate instanceof Date && !isNaN(parsedDate.getTime());

  if (!isValidDate) {
    return false;
  }

  return true;
}

export const addCommentsAdmin = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);

    if (!user) {
      return res
        .status(401)
        .json({ message: "No tiene permiso para ver esta información" });
    }

    const { comments } = req.body;
    const { turnID } = req.params;

    if (!turnID) {
      return res
        .status(400)
        .json({ message: "No todos los campos contienen un valor" });
    }

    let turn = await Turns.findByPk(turnID);

    if (!turn) {
      return res.status(404).json({ message: "No se encontró el turno" });
    }

    if (typeof comments !== "string") {
      return res
        .status(400)
        .json({ message: "Los comentarios deben ser de tipo texto" });
    }

    (turn as any).comments = comments;
    await turn.save();

    return res.status(200).json("Turno modificado con exito");
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const cancelTurn = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);

    if (!user) {
      return res
        .status(401)
        .json({ message: "No tiene permiso para ver esta información" });
    }

    if (user.role === UserRole.CLIENT) {
      return res
        .status(401)
        .json({ message: "No tiene permiso para ver esta información" });
    }

    let { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ message: "No todos los campos contienen un valor" });
    }

    const turn = await Turns.findByPk(id);
    if (!turn) {
      return res
        .status(404)
        .json({ message: "No se encontró un turno con estos parametros" });
    }

    if (turn.getDataValue("status") !== "scheduled") {
      return res.status(401).json({
        message: "No se puede cancelar un turno ya completado o cancelado",
      });
    }

    turn.set("status", "canceled");
    await turn.save();
    return res.status(200).json({ message: "Turno cancelado con exito" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const completeTurn = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);
    if (!user) {
      return res
        .status(401)
        .json({ message: "No tiene permiso para ver esta información" });
    }

    if (user.role === UserRole.CLIENT) {
      return res
        .status(401)
        .json({ message: "No tiene permiso para ver esta información" });
    }

    let { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ message: "No todos los campos contienen un valor" });
    }

    const turn = await Turns.findByPk(id);

    if (!turn) {
      return res.status(404).json({ message: "No se encontró el turno" });
    }

    if (turn.getDataValue("status") !== "scheduled") {
      return res.status(401).json({
        message: "No se puede completar un turno ya completado o cancelado",
      });
    }

    turn.set("status", "completed");
    await turn.save();
    return res.status(200).json({ message: "Turno completado con exito" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

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
