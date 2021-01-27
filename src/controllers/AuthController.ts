import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { User } from "../entity/User";
import config from "../config/config";

class AuthController {

    static register = async (req: Request, res: Response) => {
        let { email, password } = req.body;
        let user = new User();

        user.email = email;
        user.password = password;

        const errors = await validate(user);
        if (errors.length > 0) {
            res.status(400).send(errors);
            return;
        }

        user.hashPassword();

        const userRepository = getRepository(User);
        try {
            await userRepository.save(user);
        } catch (e) {
            res.status(409).send("email already in use");
            return;
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            config.jwtSecret,
            { expiresIn: config.expires }
        );

        res.status(201).send(token);
    };

    static login = async (req: Request, res: Response) => {
        let { email, password } = req.body;
        if (!(email && password)) {
            res.status(400).send();
        }

        const userRepository = getRepository(User);
        let user: User;
        try {
            user = await userRepository.findOneOrFail({ where: { email } });
        } catch (error) {
            res.status(401).send();
        }

        if (!user.checkIfUnencryptedPasswordIsValid(password)) {
            res.status(401).send();
            return;
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            config.jwtSecret,
            { expiresIn: "1h" }
        );

        res.send(token);
    };

    static changePassword = async (req: Request, res: Response) => {
        const id = res.locals.jwtPayload.userId;

        const { oldPassword, newPassword } = req.body;
        if (!(oldPassword && newPassword)) {
            res.status(400).send();
        }

        const userRepository = getRepository(User);
        let user: User;
        try {
            user = await userRepository.findOneOrFail(id);
        } catch (id) {
            res.status(401).send();
        }

        if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
            res.status(401).send();
            return;
        }

        user.password = newPassword;
        const errors = await validate(user);
        if (errors.length > 0) {
            res.status(400).send(errors);
            return;
        }
        
        user.hashPassword();
        userRepository.save(user);

        res.status(204).send();
    };
}
export default AuthController;