import { Request, Response, Next } from "express";
import * as jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { User } from "../entity/User";
import config from "../config/config";
import { SecretCode } from "../entity/SecretCode";
import * as crypto from 'crypto-random-string';
import { sendVerification } from '../helpers/emailSender';
import { HttpException } from "../exceptions/HttpException";
import { json } from "body-parser";
import { nextTick } from "process";

class AuthController {

    static register = async (req: Request, res: Response, next: Next) => {
        try {
            let { email, password } = req.body;
            let user = new User();

            user.email = email;
            user.password = password;

            const errors = await validate(user);

            if (errors.length > 0) {
                throw new HttpException(400, 'Validation error');
            }

            user.hashPassword();

            const userRepository = getRepository(User);

            const emailUser = await userRepository.findOne({ where: { email: email } });

            if (emailUser) {
                throw new HttpException(409, 'Email already in use');
            }

            await userRepository.save(user);

            let secret = new SecretCode();
            secret.email = email;
            secret.user = user;
            secret.code = crypto({ length: 100, type: 'url-safe' });

            const secretRepository = getRepository(SecretCode);

            try {
                await secretRepository.save(secret);
                sendVerification(user, secret.code);
            } catch (error) {
                throw (error);
            }

            res.status(201).send('Account created succesfully');
        } catch (error) {
            next(error);
        }
    };

    static login = async (req: Request, res: Response, next: Next) => {
        try {
            let { email, password } = req.body;

            if (!(email && password)) {
                throw new HttpException();
            }

            const userRepository = getRepository(User);

            const user = await userRepository.findOneOrFail({ where: { email } });

            if (!user.checkIfUnencryptedPasswordIsValid(password)) {
                throw new HttpException(400, 'Login failed');
            }

            const token = jwt.sign(
                { userId: user.id, email: user.email },
                config.jwtSecret,
                { expiresIn: config.expires }
            );

            res.status(200).send({
                id: user.id,
                email: user.email,
                accessToken: token,
                verified: user.verified
            });
        } catch (error) {
            next(error);
        }
    };

    static changePassword = async (req: Request, res: Response, next: Next) => {
        try {
            const id = res.locals.jwtPayload.userId;
            const { oldPassword, newPassword } = req.body;

            if (!(oldPassword && newPassword)) {
                throw new HttpException();
            }

            const userRepository = getRepository(User);

            const user = await userRepository.findOneOrFail(id);

            if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
                throw new HttpException();
            }

            user.password = newPassword;

            const errors = await validate(user);

            if (errors.length > 0) {
                throw new HttpException();
            }

            user.hashPassword();
            await userRepository.save(user);

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    static verifyAccount = async (req: Request, res: Response, next: Next) => {
        try {
            const { userId, secretCode } = req.body;

            const userRepository = getRepository(User);

            let user: User;

            user = await userRepository.findOneOrFail(userId);

            const secretRepository = getRepository(SecretCode);

            await secretRepository.findOneOrFail({ where: { email: user.email, code: secretCode } })


            user.verified = true;
            await userRepository.save(user);
            await secretRepository.delete(user.email);

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
export default AuthController;