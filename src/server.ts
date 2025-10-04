import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
import dotenv from "dotenv";
dotenv.config();
import { sequelize } from "./libs/sequelize.js";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import Boom from "@hapi/boom";

import { app } from "./app.js";
import {
	errorHandler,
	boomErrorHandler,
	ormErrorHandler,
} from "./middlewares/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

app.set("trust proxy", 1);

app.use(express.static(path.join(__dirname, "..", "./public")));

app.use((req: Request, _res: Response, next: NextFunction) => {
	next(Boom.notFound(`Route ${req.method} ${req.originalUrl} not found`));
});

app.use(boomErrorHandler);
app.use(ormErrorHandler);
app.use(errorHandler);

app.listen(PORT);

const shutdown = async () => {
	try {
		await sequelize.close();
	} finally {
		process.exit(0);
	}
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
