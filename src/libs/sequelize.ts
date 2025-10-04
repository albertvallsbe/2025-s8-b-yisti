import { Sequelize } from "sequelize";
import type { Options } from "sequelize";
import { config } from "../config/config.js";
import { setupModels } from "../db/models/index.js";

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
	const PORT = String(config.dbPort ?? "5435");
	const DB = String(config.dbName ?? "movieis");

	return `postgres://${USER}:${PASSWORD}@${HOST}:${PORT}/${DB}`;
};

const URI = buildUri();

const options: Options = {
	dialect: "postgres",
	logging: false,
	benchmark: !config.isProd,
	pool: { max: 10, min: 0, acquire: 60_000, idle: 10_000 },
};

if (config.isProd) {
	options.dialectOptions = {
		statement_timeout: 60_000,
		idle_in_transaction_session_timeout: 30_000,
		ssl: {
			require: true,
			rejectUnauthorized: false,
		},
	};
}

export const sequelize = new Sequelize(URI, options);
setupModels(sequelize);
export const models = sequelize.models;
export type DBModels = typeof sequelize.models;
