import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import config from "../config/config";

export const checkJwt = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = <string>req.headers["auth"];

    let jwtPayload;

    try {
        jwtPayload = <any>jwt.verify(token, config.jwtSecret);
        res.locals.jwtPayload = jwtPayload;
    } catch (error) {
        res.status(401).send({ error: "Access denied" });
        return;
    }

    const { userId, email } = jwtPayload;

    const newToken = jwt.sign(
        {
            userId,
            email
        },
        config.jwtSecret,
        {
            expiresIn: config.expires
        }
    );

    res.setHeader("token", newToken);

    next();
};