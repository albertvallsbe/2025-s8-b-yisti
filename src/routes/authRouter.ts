import type { Request, Response, NextFunction } from "express";
import passport from "passport";
import Boom from "@hapi/boom";
import { Router } from "express";

import type { User as UserType } from "../types/types.js";
import { AuthService } from "../services/authService.js";

export const authRouter = Router();
const service = new AuthService();

authRouter.post(
	"/login",
	passport.authenticate("local", { session: false }),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = req.user;

			if (!user) {
				return next(Boom.unauthorized());
			}

			res.json(service.signToken(user as UserType));
		} catch (error) {
			return next(error);
		}
	},
);

authRouter.post(
	"/recovery",
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { email } = req.body;

			if (!email) {
				return next(Boom.badRequest("Email is required"));
			}

			try {
				await service.sendRecovery(email);
			} catch (error) {
				if (Boom.isBoom(error) && error.output?.statusCode === 404) {
					throw Boom.badRequest("Invalid recovery request");
				}
				throw Boom.badGateway("Failed to send recovery email");
			}

			return res.status(202).json({
				message: "If the email exists, a recovery link will be sent.",
			});
		} catch (error) {
			return next(error);
		}
	},
);

authRouter.post(
	"/change-password",
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { token, newPassword } = req.body;

			if (!token) {
				return next(Boom.badRequest("Token is required"));
			}
			if (!newPassword) {
				return next(Boom.badRequest("New password is required"));
			}

			const recovery = await service.changePassword(token, newPassword);
			return res.json(recovery);
		} catch (error) {
			return next(error);
		}
	},
);
