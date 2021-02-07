import { Router } from "express";
import MembersListController from "../controllers/MembersListControlller";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.get("/", [checkJwt], MembersListController.getMembersList);

router.post("/", [checkJwt], MembersListController.newMembersList);


export default router;