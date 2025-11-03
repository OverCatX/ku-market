import { Request, Response } from "express";

export default class HealthController {
  static getHealth = (req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      message: "Server is alive and running",
    });
  };
}

