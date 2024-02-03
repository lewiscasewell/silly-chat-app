import { NextFunction, Request, Response } from "express";

const identifyClient = (req: Request, res: Response, next: NextFunction) => {
  const clientType = req.headers["x-client-type"];
  req.clientType = clientType === "mobile" ? "mobile" : "web";
  next();
};

export default identifyClient;
