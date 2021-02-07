import { Router, Request, Response } from "express";
import auth from "./auth";
import list from "./members-list";

const routes = Router();

routes.use("/auth", auth);

routes.use("/members-list", list);

export default routes;