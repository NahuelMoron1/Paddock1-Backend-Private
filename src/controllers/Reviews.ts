import { Request, Response } from "express";
import Reviews from "../models/mysql/Reviews";
import { SECRET_JWT_KEY } from "../models/config";
import { UserRole } from "../models/enums/UserRole";
import { UserStatus } from "../models/enums/UserStatus";
import { User } from "../models/Users";
import jwt from "jsonwebtoken";
import Users from "../models/mysql/Users";

export const getAttendantReviews = async (req: Request, res: Response) => {
  try {
    const { attendantID } = req.params;

    if (!attendantID) {
      return res
        .status(400)
        .json({ message: "Not all fields contains a value" });
    }

    const reviewsAux = await Reviews.findAll({
      where: { attendantID: attendantID },
      include: [
        {
          model: Users,
          as: "User", // ← cliente
          attributes: ["fullName", "profileImage"],
        },
      ],
    });

    if (!reviewsAux) {
      return res.status(404).json({ message: "No reviews found" });
    }
    return res.json(reviewsAux);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getUserReviews = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;

    if (!userID) {
      return res
        .status(400)
        .json({ message: "Not all fields contains a value" });
    }

    const reviewsAux = await Reviews.findAll({
      where: { userID: userID },
      include: [
        {
          model: Users,
          as: "User", // ← cliente
          attributes: ["fullName", "profileImage"],
        },
        {
          model: Users,
          as: "Attendant",
          attributes: ["fullName", "profileImage"],
        },
      ],
    });

    if (!reviewsAux) {
      return res.status(404).json({ message: "No reviews found" });
    }
    return res.json(reviewsAux);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getUserReview = async (req: Request, res: Response) => {
  try {
    const { userID, attendantID } = req.params;

    if (!userID || !attendantID) {
      return res
        .status(400)
        .json({ message: "Not all fields contains a value" });
    }

    const reviewsAux = await Reviews.findOne({
      where: { userID: userID, attendantID: attendantID },
    });

    if (!reviewsAux) {
      return res.status(404).json({ message: "No review found" });
    }
    return res.json(reviewsAux);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const setAttendantReview = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);

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

    if (user.role !== UserRole.CLIENT) {
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
    await Reviews.create(reviewAux);
    return res.status(200).json({ message: "Reseña creada correctamente" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const modifyReview = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);

    if (!user) {
      return res
        .status(401)
        .json({ message: "You're not allowed to see this information." });
    }

    const review = req.body;

    if (
      !validateReview(review.attendantID, review.rating, review.comment) ||
      !review.id
    ) {
      return res
        .status(400)
        .json({ message: "No todos los campos contienen un valor" });
    }

    if (user.role !== UserRole.CLIENT) {
      return res.status(304).json({
        message: "Cannot modify a review if you are admin or attendant",
      });
    }

    const reviewToDelete = await Reviews.findByPk(review.id);
    if (!reviewToDelete) {
      return res
        .status(404)
        .json({ message: "No se encontró la reseña a modificar" });
    }
    await reviewToDelete.destroy();

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

    await Reviews.create(reviewAux);
    return res.status(200).json({ message: "Reseña creada correctamente" });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: error });
  }
};

function validateReview(attendantID: string, rating: number, comment: string) {
  if (!attendantID || !rating) {
    return false;
  }
  if (comment && typeof comment !== "string") {
    return false;
  }
  return true;
}

export const deleteAttendantReview = async (req: Request, res: Response) => {
  try {
    const user = await getUserLogged(req);

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

    const reviewToDelete = await Reviews.findByPk(id);

    if (!reviewToDelete) {
      return res.status(404).json({ message: "Review not found" });
    }
    if (reviewToDelete.getDataValue("userID") !== user.id) {
      return res
        .status(401)
        .json({ message: "You're not allowed to see this information." });
    }

    await reviewToDelete.destroy();
    return res
      .status(200)
      .send({ message: "Review successfully deleted by user" });
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
