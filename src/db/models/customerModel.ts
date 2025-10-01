import { Model, DataTypes, Sequelize } from "sequelize";
import type { Optional, ModelAttributes } from "sequelize";

import type { Customer as CustomerType } from "../../types/types.js";

import { USER_TABLE } from "./userModel.js";
export const CUSTOMER_TABLE = "customers";

export type CustomerCreationAttributes = Optional<
	CustomerType,
	"id" | "createdAt" | "updatedAt"
>;

export class Customer
	extends Model<CustomerType, CustomerCreationAttributes>
	implements CustomerType
{
	declare id: number;
	declare name: string;
	declare firstSurname: string;
	declare secondSurname: string;
	declare phone: string;
	declare userId: number;
	declare createdAt: Date;
	declare updatedAt: Date;

	static associate(models: Sequelize["models"]) {
		const { User } = models as { User: typeof import("./userModel.js").User };

		this.belongsTo(User, { as: "user", foreignKey: "userId" });
	}

	static config(sequelize: Sequelize) {
		return {
			sequelize,
			tableName: CUSTOMER_TABLE,
			modelName: "Customer",
			timestamps: true,
			underscored: true,
		};
	}
}

export const CustomerSchema: ModelAttributes<Customer, CustomerType> = {
	id: {
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
		type: DataTypes.INTEGER,
	},
	name: {
		allowNull: false,
		type: DataTypes.STRING,
		field: "name",
		unique: false,
	},
	firstSurname: {
		allowNull: false,
		type: DataTypes.STRING,
		field: "first_surname",
		unique: false,
	},
	secondSurname: {
		allowNull: false,
		type: DataTypes.STRING,
		field: "second_surname",
		unique: false,
	},
	phone: {
		allowNull: false,
		type: DataTypes.STRING,
	},
	createdAt: {
		allowNull: false,
		type: DataTypes.DATE,
		field: "created_at",
		defaultValue: DataTypes.NOW,
	},
	updatedAt: {
		allowNull: false,
		type: DataTypes.DATE,
		field: "updated_at",
		defaultValue: DataTypes.NOW,
	},
	userId: {
		field: "user_id",
		allowNull: false,
		type: DataTypes.INTEGER,
		unique: true,
		references: {
			model: USER_TABLE,
			key: "id",
		},
		onUpdate: "CASCADE",
		onDelete: "SET NULL",
	},
};
