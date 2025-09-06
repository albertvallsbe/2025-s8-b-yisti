import { Strategy as StrategyJwt, ExtractJwt } from "passport-jwt";
import type { StrategyOptions } from "passport-jwt";
import { config } from "../../config/config.js";

const jwtSecretFromConfig = config.jwtSecret;
if (!jwtSecretFromConfig) {
	throw new Error("Missing JWT_SECRET");
}

const options: StrategyOptions = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: jwtSecretFromConfig,
};

export const JwtStrategy = new StrategyJwt(options, (payload, done) => {
	try {
		return done(null, payload);
	} catch (error) {
		return done(error, false);
	}
});
