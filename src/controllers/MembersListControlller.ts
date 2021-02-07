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
            console.log(list);
            res.send(list);
        } catch {
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
        } catch {
            res.status(400)
            return;
        }

        res.status(201).send(list);
    };
};

export default MembersListController;