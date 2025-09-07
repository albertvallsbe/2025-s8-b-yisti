import nodemailer, { type SendMailOptions } from "nodemailer";
import { google } from "googleapis";
import { config } from "../config/config.js";
import Boom from "@hapi/boom";

const REDIRECT_URI = "https://developers.google.com/oauthplayground";

type MailError = Error & {
	code?: string; // EAUTH, ETIMEDOUT, ESOCKET...
	responseCode?: number; // 534, 535, 550...
	command?: string;
	response?: string | { data?: unknown };
};

const getOAuth2Client = () => {
	const { googleClientId, googleClientSecret, googleRefreshToken, googleUser } =
		config;

	if (
		!googleClientId ||
		!googleClientSecret ||
		!googleRefreshToken ||
		!googleUser
	) {
		throw new Error("Missing Google OAuth2 env vars for mailer");
	}

	const client = new google.auth.OAuth2(
		googleClientId,
		googleClientSecret,
		REDIRECT_URI,
	);

	client.setCredentials({ refresh_token: googleRefreshToken });

	return {
		client,
		googleUser,
		googleClientId,
		googleClientSecret,
		googleRefreshToken,
	};
};

export const createTransport = async () => {
	const {
		client,
		googleUser,
		googleClientId,
		googleClientSecret,
		googleRefreshToken,
	} = getOAuth2Client();

	let accessToken: string | undefined;
	try {
		const accessTokenResponse = await client.getAccessToken();

		accessToken =
			typeof accessTokenResponse === "string"
				? accessTokenResponse
				: (accessTokenResponse?.token ?? undefined);

		if (!accessToken) {
			throw new Error("Empty access token from Google");
		}
	} catch (error: unknown) {
		const oauthError = error as MailError;
		const details = {
			code: oauthError.code,
			message: oauthError.message,
			response: oauthError.response,
		};
		throw Boom.badGateway("Unable to obtain Gmail access token", {
			data: details,
		});
	}

	try {
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				type: "OAuth2",
				user: googleUser,
				clientId: googleClientId,
				clientSecret: googleClientSecret,
				refreshToken: googleRefreshToken,
				accessToken,
			},
			connectionTimeout: 5_000,
			greetingTimeout: 5_000,
			socketTimeout: 5_000,
		});
		return transporter;
	} catch (error: unknown) {
		const transportError = error as MailError;
		const details = {
			code: transportError.code,
			message: transportError.message,
			response: transportError.response,
		};
		throw Boom.badGateway("Unable to create mail transporter", {
			data: details,
		});
	}
};

export const sendMail = async (options: SendMailOptions) => {
	const transporter = await createTransport();
	if (!options.from) {
		options.from = `MyStore App <${config.googleUser}>`;
	}
	try {
		await transporter.verify();

		const mail = await transporter.sendMail(options);
		return mail;
	} catch (error) {
		const mailError = error as MailError;

		const details = {
			code: mailError?.code, // EAUTH, ETIMEDOUT, ESOCKET...
			responseCode: mailError?.responseCode, // 534, 535, 550...
			command: mailError?.command,
			message: mailError?.message,
			response: mailError?.response, // resposta SMTP
		};

		console.error("[MAIL] sendMail error:", details);

		if (
			mailError?.code === "EAUTH" ||
			mailError?.responseCode === 534 ||
			mailError?.responseCode === 535
		) {
			throw Boom.boomify(new Error("Email auth failed"), {
				statusCode: 401,
				data: details,
			});
		}
		if (
			mailError?.code === "ETIMEDOUT" ||
			mailError?.code === "ESOCKET" ||
			/TIMEDOUT/i.test(mailError?.message)
		) {
			throw Boom.serverUnavailable("Email service timeout", details);
		}

		throw Boom.badGateway("Email service error", details);
	}
};
