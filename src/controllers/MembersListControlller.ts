import { Request, Response, Next } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { MembersList } from "../entity/MembersList";
import { HttpException } from "../exceptions/HttpException";
import { Member } from "../entity/Member";

class MembersListController {

    static getMembersList = async (req: Request, res: Response, next: Next) => {
        try {
            const userId = res.locals.jwtPayload.userId;

            const listRepository = getRepository(MembersList);
            const list = await listRepository.findOneOrFail(
                {
                    relations: ["members"],
                    where: { userId: userId }
                });
            res.send(list);
        } catch {
            next(new HttpException(404, 'List not found'));
        }
    };

    static newMembersList = async (req: Request, res: Response, next: Next) => {
        try {
            const userId = res.locals.jwtPayload.userId;
            let { name, members } = req.body;

            let list = new MembersList();
            list.name = name;
            list.userId = userId;
            list.members = members;

            const errors = await validate(list);
            if (errors.length > 0) {
                throw new HttpException();
            }

            const listRepository = getRepository(MembersList);
            try {
                await listRepository.save(list);
            } catch (error) {
                throw new HttpException(400, 'List already exist');
            }

            res.status(201).send(list);
        } catch (error) {
            next(error);
        }
    };

    static editMembersList = async (req: Request, res: Response, next: Next) => {
        try {
            const userId = res.locals.jwtPayload.userId;
            let { name, members } = req.body;

            let list: MembersList;
            const listRepository = getRepository(MembersList);

            try {
                list = await listRepository.findOneOrFail(
                    {
                        relations: ["members"],
                        where: { userId: userId }
                    });
            } catch {
                throw new HttpException(404);
            }

            const memberRepository = getRepository(Member);

            if (list.members?.length > 0) {
                await memberRepository.remove(list.members);
            }

            list.name = name;
            list.members = members;

            const errors = await validate(list);
            if (errors.length > 0) {
                throw new HttpException();
            }

            await listRepository.save(list);

            res.status(204).send();

        } catch (error) {
            next(error);
        }
    };
};

export default MembersListController;