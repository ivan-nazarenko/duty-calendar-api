
import "reflect-metadata";
import { createConnection } from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as helmet from "helmet";
import * as cors from "cors";
import * as dotenv from 'dotenv';
import routes from "./routes";
import errorHandler from "./middlewares/errorHandler";

const port = process.env.PORT || 5000;

dotenv.config();

createConnection().then(async connection => {

    const app = express();

    app.use(cors());

    app.use(helmet());

    app.use(bodyParser.json());

    app.use("/", routes);

    app.use(errorHandler);

    app.listen(port, () => {
        console.log("Server started on port " + port);
    });
    
}).catch(error => console.log(error));