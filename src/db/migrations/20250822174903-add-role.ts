import type { QueryInterface } from "sequelize";
import type * as SequelizeNS from "sequelize";
import { USER_TABLE } from "../models/userModel.js";

/** @type {import('sequelize-cli').Migration} */
export default {
	async up(
		queryInterface: QueryInterface,
		Sequelize: typeof SequelizeNS,
	): Promise<void> {
		const table = await queryInterface.describeTable(USER_TABLE);
		if (!table.role) {
			// eslint-disable-next-line no-console
			console.log(!table.role);
			await queryInterface.addColumn(USER_TABLE, "role", {
				type: Sequelize.ENUM("admin", "customer", "seller"),
				allowNull: false,
				defaultValue: "customer",
			});
		}
		if (!table.role) {
			// eslint-disable-next-line no-console
			console.log(!table.role);
		}
	},

	async down(queryInterface: QueryInterface): Promise<void> {
		const table = await queryInterface.describeTable(USER_TABLE);
		if (table.role) {
			await queryInterface.removeColumn(USER_TABLE, "role");
		}
	},
};
