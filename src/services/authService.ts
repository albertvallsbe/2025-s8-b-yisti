import { ValidationError, DatabaseError } from "sequelize";
import Boom from "@hapi/boom";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { config } from "./../config/config.js";
import type {
	User as UserType,
	userJwtPayload,
	AuthUser,
} from "../types/types.js";

import { UserService } from "../services/userService.js";
import { sendMail as sendMailReusable } from "../libs/mailer.js";
import type { SendMailOptions } from "nodemailer";

const service = new UserService();

export class AuthService {
	async getUser(email: string, password: string) {
		try {
			const user = await service.findByEmail(email);
			if (!user) {
				throw Boom.notFound("User not found");
			}

			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) {
				throw Boom.unauthorized();
			}

			return user as AuthUser;
		} catch (error) {
			if (Boom.isBoom(error)) throw error;
			if (error instanceof DatabaseError) {
				throw Boom.badGateway("Database error while fetching user");
			}
			if (error instanceof ValidationError) {
				throw Boom.badRequest(error.message);
			}
			throw Boom.badImplementation("Failed to fetch user");
		}
	}

	signToken(user: UserType) {
		try {
			if (!user) {
				throw Boom.notFound("User not found");
			}

			const { id, role, email } = user as UserType;
			const payload: userJwtPayload = {
				sub: String(id),
				role: role,
			};

			const JWT_SECRET = config.jwtSecret;
			if (!JWT_SECRET) {
				throw Boom.badImplementation("Missing JWT_SECRET");
			}

			const token = jwt.sign(payload, JWT_SECRET);

			const authUser: AuthUser = {
				id: id,
				email: email,
				role: role,
			};

			return { user: authUser, token };
		} catch (error) {
			if (Boom.isBoom(error)) throw error;
			if (error instanceof DatabaseError) {
				throw Boom.badGateway("Database error while fetching user");
			}
			if (error instanceof ValidationError) {
				throw Boom.badRequest(error.message);
			}
			throw Boom.badImplementation("Failed to fetch user");
		}
	}

	async sendRecovery(email: string) {
		try {
			const user = await service.findByEmail(email);
			if (!user) {
				throw Boom.notFound("User not found");
			}

			const JWT_SECRET = config.jwtSecret;
			if (!JWT_SECRET) {
				throw Boom.badImplementation("Missing JWT_SECRET");
			}

			const { id, email: userEmail } = user as UserType;
			const payload: userJwtPayload = {
				sub: String(id),
			};

			const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
			await service.updatePatch(String(id), { recoveryToken: token });

			const mail: SendMailOptions = {
				to: userEmail,
				subject: "Aquest es un correu nou",
				html: `<b>Token => ${token}</b>`,
			};

			const resposta = await sendMailReusable(mail);
			return resposta;
		} catch (error) {
			if (Boom.isBoom(error)) throw error;
			if (error instanceof DatabaseError) {
				throw Boom.badGateway("Database error while fetching user");
			}
			if (error instanceof ValidationError) {
				throw Boom.badRequest(error.message);
			}
			throw Boom.badImplementation("Failed to fetch user");
		}
	}

	async changePassword(token: string, newPassword: string) {
		try {
			const JWT_SECRET = config.jwtSecret;
			if (!JWT_SECRET) {
				throw Boom.badImplementation("Missing JWT_SECRET");
			}

			const payload = jwt.verify(token, JWT_SECRET);

			const { sub } = payload as userJwtPayload;

			const user = await service.findById(sub);
			if (!user) {
				throw Boom.notFound("User not found");
			}

			if (user.recoveryToken !== token) {
				throw Boom.unauthorized();
			}

			const hash = await bcrypt.hash(newPassword, 10);

			await service.updatePatch(String(user.id), {
				recoveryToken: null,
				password: hash,
			});
			return { message: "password changed " };
		} catch (error) {
			if (Boom.isBoom(error)) throw error;
			if (error instanceof DatabaseError) {
				throw Boom.badGateway("Database error while changing password");
			}
			if (error instanceof ValidationError) {
				throw Boom.badRequest(error.message);
			}
			throw Boom.badImplementation("Failed to change password");
		}
	}
}
