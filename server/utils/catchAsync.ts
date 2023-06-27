import { Request, Response, NextFunction } from "express";

export default (func: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    func(req, res, next).catch(next);
  };
};
