
import "reflect-metadata";
import { createConnection } from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as helmet from "helmet";
import * as cors from "cors";
import * as dotenv from 'dotenv';
import routes from "./routes";

dotenv.config();

createConnection().then(async connection => {

    const app = express();

    app.use(cors());
    app.use(helmet());
    app.use(bodyParser.json());

    app.use("/", routes);

    app.listen(5000, () => {
        console.log("Server started on port 5000!");
    });
}).catch(error => console.log(error));