import { faker } from "@faker-js/faker";
import {
	ValidationError,
	UniqueConstraintError,
	DatabaseError,
} from "sequelize";
import Boom from "@hapi/boom";
import bcrypt from "bcrypt";

import type { User as UserType, UserRole } from "../types/types.js";
import { User as UserModel } from "../db/models/userModel.js";

export type AuthUser = {
	id: number;
	email: string;
	role: UserRole;
	name?: string | "null";
};

export class UserService {
	private users: Omit<UserType, "id">[] = [];

	constructor() {
		this.generate();
	}

	async generate(): Promise<void> {
		try {
			const limit = 12;
			for (let index = 0; index < limit; index++) {
				this.users.push({
					email: faker.internet.email(),
					password: faker.internet.password({ length: 12 }),
					role: faker.helpers.arrayElement(["admin", "customer", "seller"]),
					createdAt: new Date(),
					updatedAt: new Date(),
				});
			}
			return;
		} catch (error) {
			if (Boom.isBoom(error)) throw error;
			throw Boom.badImplementation("Failed to generate users", {
				cause: error,
			});
		}
	}

	async create(data: Omit<UserType, "id">): Promise<UserType> {
		try {
			const hash = await bcrypt.hash(data.password, 10);

			const newUser = await UserModel.create({
				...data,
				password: hash,
			});

			const { password: _drop, ...safeUser } = newUser.toJSON();

			return safeUser as UserType;
		} catch (error) {
			if (Boom.isBoom(error)) throw error;
			if (error instanceof UniqueConstraintError) {
				throw Boom.conflict("Email already exist");
			}
			if (error instanceof ValidationError) {
				throw Boom.badRequest(error.message);
			}
			throw Boom.badImplementation("Failed to create user");
		}
	}

	// async find(): Promise<UserType[]> {
	// 	try {
	// 		const users = await UserModel.findAll({
	// 			include: [{ association: "customer" }],
	// 		});

	// 		return users as UserType[];
	// 	} catch (error) {
	// 		if (Boom.isBoom(error)) throw error;
	// 		if (error instanceof DatabaseError) {
	// 			throw Boom.badGateway("Database error while fetching users");
	// 		}
	// 		if (error instanceof ValidationError) {
	// 			throw Boom.badRequest(error.message);
	// 		}
	// 		throw Boom.badImplementation("Failed to fetch users");
	// 	}
	// }

	async find(): Promise<AuthUser[]> {
		try {
			const users = await UserModel.findAll({
				attributes: ["id", "email", "role"],
				include: [
					{
						association: "customer",
						attributes: ["name"],
					},
				],
			});

			const result: AuthUser[] = users.map((u) => {
				const json = u.toJSON() as {
					id: number;
					email: string;
					role: UserRole;
					customer?: { name?: string | "null" };
				};

				return {
					id: json.id,
					email: json.email,
					role: json.role,
					name: json.customer?.name ?? "null",
				};
			});

			return result;
			// return users as AuthUser[];
		} catch (error) {
			if (Boom.isBoom(error)) throw error;
			if (error instanceof DatabaseError) {
				throw Boom.badGateway("Database error while fetching users");
			}
			if (error instanceof ValidationError) {
				throw Boom.badRequest(error.message);
			}
			throw Boom.badImplementation("Failed to fetch users");
		}
	}

	async findByEmail(email: string): Promise<UserType> {
		try {
			const user = await UserModel.findOne({
				where: { email },
			});

			return user as UserType;
		} catch (error) {
			if (Boom.isBoom(error)) throw error;
			if (error instanceof DatabaseError) {
				throw Boom.badGateway("Database error while fetching users");
			}
			if (error instanceof ValidationError) {
				throw Boom.badRequest(error.message);
			}
			throw Boom.badImplementation("Failed to fetch users");
		}
	}

	async findById(id: string): Promise<UserType> {
		try {
			const user = await UserModel.findByPk(id);
			if (!user) {
				throw Boom.notFound(`User ${id} not found`);
			}

			return user.toJSON() as UserType;
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

	async updatePatch(
		id: string,
		changes: Partial<Omit<UserType, "id">>,
	): Promise<UserType> {
		try {
			const user = await UserModel.findByPk(id);
			if (!user) {
				throw Boom.notFound(`User ${id} not found`);
			}

			const {
				createdAt: _createdAt,
				updatedAt: _updatedAt,
				...safeChanges
			} = changes;
			const updatedUser = await user.update(safeChanges);

			return updatedUser.toJSON() as UserType;
		} catch (error) {
			if (Boom.isBoom(error)) throw error;
			if (error instanceof UniqueConstraintError) {
				throw Boom.conflict("Email already exists");
			}
			if (error instanceof ValidationError) {
				throw Boom.badRequest(error.message);
			}
			if (error instanceof DatabaseError) {
				throw Boom.badGateway("Database error while updating user");
			}
			throw Boom.badImplementation("Failed to update user");
		}
	}

	async deleteById(id: string): Promise<void> {
		try {
			const user = await UserModel.findByPk(id);
			if (!user) {
				throw Boom.notFound(`User ${id} not found`);
			}

			await user.destroy();
			return;
		} catch (error) {
			if (Boom.isBoom(error)) throw error;
			if (error instanceof DatabaseError) {
				throw Boom.badGateway("Database error while deleting user");
			}
			if (error instanceof ValidationError) {
				throw Boom.badRequest(error.message);
			}
			throw Boom.badImplementation("Failed to delete user");
		}
	}
}
