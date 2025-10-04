import { Pool } from "pg";
import { config } from "../config/config.js";

let URI: string;

if (config.isProd) {
	if (!config.databaseUrl) {
		throw new Error("DATABASE_URL is required in production");
	}
	URI = config.databaseUrl;
} else {
	const { dbUser, dbPassword, dbHost, dbPort, dbName } = config;

	if (!dbUser || !dbPassword || !dbHost || !dbPort || !dbName) {
		throw new Error(
			"Missing DB env vars: DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME",
		);
	}

	const USER = encodeURIComponent(dbUser);
	const PASSWORD = encodeURIComponent(dbPassword);

	URI = `postgres://${USER}:${PASSWORD}@${dbHost}:${dbPort}/${dbName}`;
}

export const pool = new Pool({ connectionString: URI });
