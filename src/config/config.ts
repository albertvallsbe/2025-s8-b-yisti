import dotenv from "dotenv";
dotenv.config();

export const requireEnv = (envVarName: string, fallback?: string): string => {
	const rawValue = process.env[envVarName];
	const value = rawValue?.trim() ?? fallback;

	if (!value) {
		throw new Error(`Missing required env var: ${envVarName}`);
	}
	return value;
};

const env = requireEnv("NODE_ENV", "development");
const isProd = env === "production" ? true : false;

export const config = {
	env,
	isProd,
	databaseUrl: requireEnv("DATABASE_URL", ""),
	jwtSecret: requireEnv("JWT_SECRET"),
	apiKey: requireEnv("API_KEY"),
	googleClientId: requireEnv("GOOGLE_CLIENT_ID"),
	googleClientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
	googleRefreshToken: requireEnv("GOOGLE_REFRESH_TOKEN"),
	googleUser: requireEnv("GOOGLE_USER"),
	port: isProd ? undefined : Number(requireEnv("PORT", "3110")),
	dbUser: isProd ? undefined : requireEnv("DB_USER"),
	dbPassword: isProd ? undefined : requireEnv("DB_PASSWORD"),
	dbHost: isProd ? undefined : requireEnv("DB_HOST"),
	dbName: isProd ? undefined : requireEnv("DB_NAME"),
	dbPort: isProd ? undefined : Number(requireEnv("DB_PORT", "5435")),
};
