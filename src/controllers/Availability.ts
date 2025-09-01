import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { SECRET_JWT_KEY } from "../models/config";
import { UserRole } from "../models/enums/UserRole";
import { UserStatus } from "../models/enums/UserStatus";
import Availability from "../models/mysql/Availability";
import { User } from "../models/Users";
export const getAttendantAvailability = async (req: Request, res: Response) => {
  try {
    const { attendantID } = req.params;

    if (!attendantID) {
      return res
        .status(400)
        .json({ message: "Not all fields contains a value." });
    }

    const availability = await Availability.findAll({
      where: { attendantID: attendantID },
    });

    if (!availability) {
      return res.status(404).json({ message: "No availability found" });
    }

    const dayOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const sortedAvailability = availability.sort(
      (a: any, b: any) =>
        dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek)
    );
    return res.json(sortedAvailability);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const isAttendantAvailable = async (
  attendantID: string,
  date: string
) => {
  if (!attendantID || !date) {
    return {
      available: false,
      message: "Not all fields have a value",
    };
  }
  try {
    const datetime = new Date(date);

    // 1. Obtener día de la semana en inglés (ej: "Monday")
    const dayOfWeek = datetime.toLocaleDateString("en-US", { weekday: "long" });

    // 2. Obtener la hora en formato "HH:mm"
    const hour = datetime.toTimeString().slice(0, 5); // ej: "14:30"

    // 3. Buscar disponibilidad para ese día y que cubra ese horario

    const availability = await Availability.findOne({
      where: {
        attendantID,
        dayOfWeek,
        startTime: { [Op.lte]: hour },
        endTime: { [Op.gte]: hour },
      },
    });
    if (availability) {
      return { available: true };
    } else {
      return {
        available: false,
        message: "No availability at that time",
      };
    }
  } catch (err) {
    return {
      available: false,
      message: "An error happened",
    };
  }
};

export const checkAttendantAvailability = async (
  req: Request,
  res: Response
) => {
  try {
    const { attendantID, date } = req.body;
    const isAvailable = await isAttendantAvailable(attendantID, date);

    if (!isAvailable?.available) {
      return res.status(304).send(false);
    }
    return res.status(200).send(true);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const postAttendantAvailability = async (
  req: Request,
  res: Response
) => {
  try {
    const user = await getUserLogged(req);

    if (!user) {
      return res
        .status(401)
        .json({ message: "You're not allowed to see this information." });
    }

    if (user.role !== UserRole.ATTENDANT) {
      return res
        .status(401)
        .json({ message: "You're not allowed to see this information." });
    }

    const { dayOfWeek, startTime, endTime } = req.body;

    if (!validateAvailability(dayOfWeek, startTime, endTime)) {
      return res
        .status(400)
        .json({ message: "Not all fields contains a value." });
    }

    const attendantID = user.id;
    const availability = { attendantID, dayOfWeek, startTime, endTime };
    await Availability.create(availability);
    return res
      .status(200)
      .json({ message: "availability created successfully" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

function validateAvailability(dayOfWeek: any, startTime: any, endTime: any) {
  if (!dayOfWeek || !startTime || !endTime) {
    return false;
  }
  return true;
}

export const modifyAttendantAvailability = async (
  req: Request,
  res: Response
) => {
  try {
    const user = await getUserLogged(req);

    if (!user) {
      return res
        .status(401)
        .json({ message: "You're not allowed to see this information." });
    }

    if (user.role !== UserRole.ATTENDANT) {
      return res
        .status(401)
        .json({ message: "You're not allowed to see this information." });
    }

    const { id, dayOfWeek, startTime, endTime } = req.body;

    if (!dayOfWeek && !startTime && !endTime) {
      return res.status(400).json({ message: "Nothing sent to modify" });
    }

    const availabilityToModify = await Availability.findByPk(id);

    if (!availabilityToModify) {
      return res
        .status(404)
        .json({ message: "Cannot modify: we didn't found this availability" });
    }

    if (dayOfWeek) {
      availabilityToModify.set("dayOfWeek", dayOfWeek);
    }
    if (startTime) {
      availabilityToModify.set("startTime", startTime);
    }
    if (endTime) {
      availabilityToModify.set("endTime", endTime);
    }

    await availabilityToModify.save();
    return res
      .status(200)
      .json({ message: "Availability modificated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const deleteAttendantAvailability = async (
  req: Request,
  res: Response
) => {
  try {
    const user = await getUserLogged(req);

    if (!user) {
      return res
        .status(401)
        .json({ message: "You're not allowed to see this information." });
    }

    if (user.role !== UserRole.ATTENDANT) {
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

    const availabilityToDelete = await Availability.findByPk(id);

    if (!availabilityToDelete) {
      return res
        .status(404)
        .json({ message: "Cannot delete: we didn't found this availability" });
    }

    await availabilityToDelete.destroy();
    return res
      .status(200)
      .json({ message: "Availability deleted successfully" });
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
