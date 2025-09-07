import type { Request, Response, NextFunction } from "express";
import Boom from "@hapi/boom";
import type { Boom as BoomType } from "@hapi/boom";
import { ValidationError } from "sequelize";

import type { AppError } from "../types/types.js";

export const boomErrorHandler = (
	error: AppError | BoomType,
	_req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (Boom.isBoom(error)) {
		const { output, data } = error as BoomType;
		return res
			.status(output.statusCode)
			.json({ ...output.payload, ...(data ? { details: data } : {}) });
	} else {
		return next(error);
	}
};

export const ormErrorHandler = (
	error: AppError | BoomType,
	_req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (error instanceof ValidationError) {
		return res.status(409).json({
			statusCode: 409,
			message: error.name,
			errors: error.errors,
		});
	}
	return next(error);
};

export const errorHandler = (
	error: AppError | Error,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	if (res.headersSent) return;

	const hasStatusCode =
		typeof (error as AppError).statusCode === "number" &&
		Number.isFinite((error as AppError).statusCode);

	// const statusCode = error.statusCode || 500;
	const statusCode = hasStatusCode ? (error as AppError).statusCode! : 500;
	const message = error.message || "An internal server error occurred";

	console.error(
		`[ERROR] ${new Date().toISOString()} - ${statusCode} - ${message}`,
	);

	if (error.stack) {
		console.error(error.stack);
	}

	return res.status(statusCode).json({
		status: "error",
		statusCode,
		message,
		...(process.env.NODE_ENV === "development" && { stack: error.stack }),
	});
};
