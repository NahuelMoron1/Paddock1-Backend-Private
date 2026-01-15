import { Request, Response } from "express";
import Season_Tracks from "../models/mysql/Seasons_Tracks";

/*export const getAllSeason_tracks = async (req: Request, res: Response) => {
  try {
    const season_tracks = await Season_Tracks.findAll();

    if (!season_tracks) {
      return res.status(404).json({ message: "No season_tracks found" });
    }

    return res.json(season_tracks);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

export const deleteSeason_track = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Bad request" });
    }

    const season_track = await Season_Tracks.findByPk(id);

    if (!season_track) {
      return res
        .status(404)
        .json({ message: "No season_track found to delete" });
    }

    await season_track.destroy();

    return res.status(200).json({ message: "Successfully deleted" });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

export const addSeason_track = async (req: Request, res: Response) => {
  try {
    const season_track = req.body;
    const validated = validateSeasonTrack(
      season_track.seasonID,
      season_track.trackID,
      season_track.round_number,
      season_track.laps
    );

    if (!validated) {
      return res.status(400).json({ message: "Bad request" });
    }

    const season_tracks = season_track;
    await Season_Tracks.create(season_tracks);
    return res.status(200).json({
      message: `Successfully added a season_track`,
    });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

export const modifySeason_track = async (req: Request, res: Response) => {
  try {
    const newSeason_track = req.body;

    if (!newSeason_track) {
      return res.status(400).json({ message: "Bad request" });
    }

    const validated = validateSeasonTrack(
      newSeason_track.seasonID,
      newSeason_track.trackID,
      newSeason_track.round_number,
      newSeason_track.laps
    );

    if (!newSeason_track.id || !validated) {
      return res
        .status(400)
        .json({ message: "Not all fields contains a value" });
    }

    await Season_Tracks.update(
      {
        seasonID: newSeason_track.seasonID,
        trackID: newSeason_track.trackID,
        round_number: newSeason_track.round_number,
        laps: newSeason_track.laps,
        sprint: newSeason_track.sprint || false,
      },
      { where: { id: newSeason_track.id } }
    );
    return res.status(200).json({
      message: `Successfully updated the season_team ${newSeason_track.id}`,
    });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

function validateSeasonTrack(
  seasonID: string,
  trackID: string,
  round_number: number,
  laps: number
) {
  if (!seasonID || !trackID || !round_number || !laps) {
    return false;
  }
  return true;
}
*/
