/** Utility for capturing and forwarding errors from asynchronous route handlers. */
import { Request, Response, NextFunction } from "express";

export const catchAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
};
