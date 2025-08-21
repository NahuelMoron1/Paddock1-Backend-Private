import { SECRET_JWT_KEY } from "../models/config";
import { UserRole } from "../models/enums/UserRole";
import { UserStatus } from "../models/enums/UserStatus";
import { Socialworks } from "../models/mysql/associations";
import { Request, Response } from "express";
import { User } from "../models/Users";
import jwt from "jsonwebtoken";
import { AttendantXSocialworks } from "../models/mysql/associations";

export const getActiveSocialworks = async (req: Request, res: Response) => {
  try {
    const activeSocialworks = await Socialworks.findAll({
      where: { active: true },
    });

    if (!activeSocialworks) {
      return res
        .status(404)
        .json({ message: "No active attendants at the moment" });
    }

    return res.json(activeSocialworks);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getinActiveSocialworks = async (req: Request, res: Response) => {
  try {
    const inactiveSocialworks = await Socialworks.findAll({
      where: { active: false },
    });

    if (!inactiveSocialworks) {
      return res
        .status(404)
        .json({ message: "No active attendants at the moment" });
    }

    return res.json(inactiveSocialworks);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getAllSocialworks = async (req: Request, res: Response) => {
  try {
    const allSocialworks = await Socialworks.findAll();

    if (!allSocialworks) {
      return res
        .status(404)
        .json({ message: "No active attendants at the moment" });
    }

    return res.json(allSocialworks);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const SetActiveSocialwork = async (req: Request, res: Response) => {
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
      return res.status(400).json({
        message: "Not all fields contains a value.",
      });
    }

    const activeSocialwork = await Socialworks.findOne({
      where: { id: id, active: false },
    });

    if (!activeSocialwork) {
      return res
        .status(404)
        .json({ message: "No social work matches this requirements" });
    }

    activeSocialwork.set("active", true);
    await activeSocialwork.save();
    return res.json({ message: "Social work set to active" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const SetinActiveSocialwork = async (req: Request, res: Response) => {
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
      return res.status(400).json({
        message: "Not all fields contains a value.",
      });
    }

    const inactiveSocialwork = await Socialworks.findOne({
      where: { id: id, active: true },
    });

    if (!inactiveSocialwork) {
      return res
        .status(404)
        .json({ message: "No social work matches this requirements" });
    }

    inactiveSocialwork.set("active", false);
    await inactiveSocialwork.save();
    return res.json({ message: "Social work set to active" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getSocialworkByAttendant = async (req: Request, res: Response) => {
  try {
    const { attendantID } = req.params;

    if (!attendantID) {
      return res.status(400).json({
        message: "Not all fields contains a value.",
      });
    }

    const socialworks = await Socialworks.findAll({
      where: { active: true },
      include: [
        {
          model: AttendantXSocialworks,
          where: { attendantID: attendantID },
        },
      ],
    });

    if (!socialworks) {
      return res.status(404).json({
        message: "No attendants at the moment with the current social work",
      });
    }

    return res.json(socialworks);
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
