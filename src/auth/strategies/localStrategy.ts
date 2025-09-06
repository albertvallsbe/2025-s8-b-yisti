import { Strategy as StrategyLocal } from "passport-local";
import Boom from "@hapi/boom";

import { AuthService } from "./../../services/authService.js";

const service = new AuthService();

export const LocalStrategy = new StrategyLocal(
	{ usernameField: "email", passwordField: "password" },
	async (email, password, done) => {
		try {
			const user = await service.getUser(email, password);
			if (!user) {
				return done(Boom.unauthorized(), false);
			}

			return done(null, user);
		} catch (error) {
			return done(error, false);
		}
	},
);
