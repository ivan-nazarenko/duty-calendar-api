import { Router } from "express";
import MembersListController from "../controllers/MembersListControlller";
import { checkJwt } from "../middlewares/checkJwt";
import { checkEmailVerification } from "../middlewares/chekEmailVerification";

const router = Router();

router.get("/", [checkJwt, checkEmailVerification], MembersListController.getMembersList);

router.post("/", [checkJwt, checkEmailVerification], MembersListController.newMembersList);

router.patch("/", [checkJwt, checkEmailVerification], MembersListController.editMembersList);


export default router;