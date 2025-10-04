import dotenv from "dotenv";
import { config } from "../config/config.js";
dotenv.config();

const buildUri = () => {
	if (config.isProd) {
		if (!config.databaseUrl) {
			throw new Error("DATABASE_URL is required in production");
		}
		return config.databaseUrl;
	}

	const USER = encodeURIComponent(config.dbUser ?? "");
	const PASSWORD = encodeURIComponent(config.dbPassword ?? "");
	const HOST = String(config.dbHost ?? "localhost");
	const PORT = String(config.dbPort ?? "5432");
	const DB = String(config.dbName ?? "my_store");

	return `postgres://${USER}:${PASSWORD}@${HOST}:${PORT}/${DB}`;
};

const URI = buildUri();

export default {
	development: {
		url: URI,
		dialect: "postgres",
	},
	production: {
		url: URI,
		dialect: "postgres",
		dialectOptions: {
			ssl: { require: true, rejectUnauthorized: false },
		},
	},
};
