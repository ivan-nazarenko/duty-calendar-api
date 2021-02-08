import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { MembersList } from "../entity/MembersList";

class MembersListController {

    static getMembersList = async (req: Request, res: Response) => {
        const userId = res.locals.jwtPayload.userId;

        const listRepository = getRepository(MembersList);
        try {
            const list = await listRepository.findOneOrFail(
                {
                    relations: ["members", "dutyEvents"],
                    where: { userId: userId }
                });
            res.send(list);
        } catch (err) {
            console.log(err);
            res.status(404).send("List not found");
        }
    };

    static newMembersList = async (req: Request, res: Response) => {
        const userId = res.locals.jwtPayload.userId;
        let { name, members } = req.body;

        let list = new MembersList();
        list.name = name;
        list.userId = userId;
        list.members = members;

        const errors = await validate(list);
        if (errors.length > 0) {
            res.status(400).send(errors);
            return;
        }

        const listRepository = getRepository(MembersList);
        try {
            await listRepository.save(list);
        } catch (err) {
            console.log(err);
            res.status(400).send(err);
        }

        res.status(201).send(list);
    };

    static editMembersList = async (req: Request, res: Response) => {
        const userId = res.locals.jwtPayload.userId;
        let { name, members } = req.body;

        let list;
        const listRepository = getRepository(MembersList);
        try {
            list = await listRepository.findOneOrFail({ where: { userId: userId } });
        } catch {
            res.status(404);
        }

        list.name = name;
        list.members = members;

        const errors = await validate(list);
        if (errors.length > 0) {
            res.status(400).send(errors);
            return;
        }

        try {
            await listRepository.save(list);
        } catch {
            res.status(400).send("Incorrect data");
        }

        res.status(204).send();

    };
};

export default MembersListController;