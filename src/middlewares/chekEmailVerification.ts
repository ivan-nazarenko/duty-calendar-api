import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { User } from "../entity/User";

export const checkEmailVerification = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = res.locals.jwtPayload.userId;

    const userRepository = getRepository(User);

    try {
        const user = await userRepository.findOneOrFail(userId);
        if (!user.verified) {
            res.status(401).send({ error: "Unverified email" });
            return;
        }
    } catch (error) {
        res.status(401).send({ error: "Access denied" });
        return;
    }

    next();
};