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
	const PORT = String(config.dbPort ?? "5432");
	const DB = String(config.dbName ?? "my_store");

	return `postgres://${USER}:${PASSWORD}@${HOST}:${PORT}/${DB}`;
};

const URI = buildUri();

const options: Options = {
	dialect: "postgres",
	logging: !config.isProd,
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

// Development

// console.log("[Models]", Object.keys(sequelize.models));
// await sequelize
// 	.authenticate()
// 	.then(() => console.log("[DB] OK"))
// 	.catch(console.error);

// console.log("[DB cfg]", {
// 	host: config.dbHost,
// 	port: config.dbPort,
// 	db: config.dbName,
// 	user: config.dbUser,
// });

// const u = new URL(URI);
// const safeURI = `${u.protocol}//${u.username}:***@${u.host}${u.pathname}`;
// console.log("[DB URI]", safeURI);
