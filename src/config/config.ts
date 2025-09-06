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

export const config = {
	env,
	isProd: env === "production" ? true : false,
	port: Number(requireEnv("PORT", "3100")),
	dbUser: requireEnv("DB_USER"),
	dbPassword: requireEnv("DB_PASSWORD"),
	dbHost: requireEnv("DB_HOST"),
	dbName: requireEnv("DB_NAME"),
	dbPort: Number(requireEnv("DB_PORT", "5432")),
	dbUrl: requireEnv("DATABASE_URL", ""),
	jwtSecret: requireEnv("JWT_SECRET"),
	apiKey: requireEnv("API_KEY"),
	googleClientId: requireEnv("GOOGLE_CLIENT_ID"),
	googleClientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
	googleRefreshToken: requireEnv("GOOGLE_REFRESH_TOKEN"),
	googleUser: requireEnv("GOOGLE_USER"),
};
