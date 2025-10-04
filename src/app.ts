import express from "express";
import cors from "cors";
import type { CorsOptions } from "cors";
import type { Request, Response } from "express";

import { router } from "./routes/index.js";
import { checkApiKey } from "./middlewares/authHandler.js";

export const app = express();

const whitelist: string[] = [
	"http://localhost:3100",
	"http://127.0.0.1:3100",
	"http://localhost:5500",
	"http://127.0.0.1:5500",
	"https://2025-yisti.up.railway.app",
	// Vite dev + preview
	"http://localhost:5173",
	"http://127.0.0.1:5173",
	"http://localhost:4173",
	"http://127.0.0.1:4173",
	// Url publica del front
	"https://yisti.netlify.app",
];

const corsOptions: CorsOptions = {
	origin: (origin, callback) => {
		if (!origin || whitelist.includes(origin) || !origin) {
			return callback(null, true);
		} else {
			return callback(null, false);
		}
	},
};
app.use(cors(corsOptions));
import "./auth/index.js";

app.get("/new-route", checkApiKey, (req: Request, res: Response) => {
	res.send("Hello");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);
// app.use("/api", router);

app.get("/", (req: Request, res: Response) => {
	res.send("OK");
});
