import { Request, Response } from "express";
import MeetupPreset from "../../data/models/MeetupPreset";

export default class MeetupPresetController {
  // GET /api/meetup-presets - Get active meetup presets (public)
  getActivePresets = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const presets = await MeetupPreset.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .select("label locationName address lat lng");

      return res.json({
        success: true,
        presets: presets.map((preset) => ({
          label: preset.label,
          locationName: preset.locationName,
          address: preset.address,
          lat: preset.lat,
          lng: preset.lng,
        })),
      });
    } catch (error) {
      console.error("Get active presets error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };
}

