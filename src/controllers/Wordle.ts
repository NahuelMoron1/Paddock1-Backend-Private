import cron from "node-cron";
import { Op } from "sequelize";
import { Drivers } from "../models/mysql/associations";
import WordleWord from "../models/mysql/WordleWord";

cron.schedule("0 0 * * *", async () => {
  const count = await Drivers.count({
    where: {
      popularity: {
        [Op.between]: [3, 5],
      },
    },
  });

  const offset = Math.floor(Math.random() * count);

  const recentWords = await WordleWord.findAll({
    order: [["date", "DESC"]],
    limit: 7,
  });

  const excluded = recentWords.map((w) => w.getDataValue("word"));

  const driver = await Drivers.findOne({
    where: {
      popularity: {
        [Op.between]: [3, 5],
      },
      lastname: {
        [Op.notIn]: excluded,
      },
    },
    offset,
  });

  if (driver) {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    await WordleWord.upsert({
      date: today,
      word: driver.getDataValue("lastname").toLowerCase(),
    });

    console.log(`Wordle actualizado: ${driver.getDataValue("lastname")}`);
  }
});
