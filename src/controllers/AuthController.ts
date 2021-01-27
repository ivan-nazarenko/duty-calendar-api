import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { User } from "../entity/User";
import config from "../config/config";
import { SecretCode } from "../entity/SecretCode";
import * as crypto from 'crypto-random-string';
import { sendVerification } from '../helpers/emailSender';

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

        let secret = new SecretCode();
        secret.email = email;
        secret.user = user;
        secret.code = crypto({ length: 100, type: 'url-safe' });

        const secretRepository = getRepository(SecretCode);

        try {
            await secretRepository.save(secret);
            sendVerification(user, secret.code);
        } catch (error) {
            res.status(500).send(error.message);
            return;
        }

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

    static verifyAccount = async (req: Request, res: Response) => {
        const { userId, secretCode } = req.params;

        const userRepository = getRepository(User);
        let user: User;
        try {
            user = await userRepository.findOneOrFail(userId);
        } catch (id) {
            res.status(401).send();
        }

        const secretRepository = getRepository(SecretCode);
        let secret: SecretCode;
        try {
            secret = await secretRepository.findOneOrFail({ where: { email: user.email, code: secretCode } })
        } catch {
            res.status(401).send();
        }

        user.verified = true;
        userRepository.save(user);
        secretRepository.delete(user.email);

        res.status(204).send();
    }
}
export default AuthController;