import type { Request, Response, NextFunction } from "express";
import passport from "passport";
import Boom from "@hapi/boom";
import { Router } from "express";

import { OrderService } from "../services/orderService.js";
import type { userJwtPayload } from "../types/types.js";

export const profileRouter = Router();
const service = new OrderService();

profileRouter.get(
	"/my-orders",
	passport.authenticate("jwt", { session: false }),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = req.user;

			if (!user) {
				return next(Boom.unauthorized());
			}
			const { sub } = user as userJwtPayload;

			const orders = await service.findByUser(sub);

			return res.json(orders);
		} catch (error) {
			return next(error);
		}
	},
);
