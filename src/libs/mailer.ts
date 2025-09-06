import nodemailer, { type SendMailOptions } from "nodemailer";
import { google } from "googleapis";
import { config } from "../config/config.js";

const REDIRECT_URI = "https://developers.google.com/oauthplayground";

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

	const accessTokenResp = await client.getAccessToken();
	const accessToken =
		typeof accessTokenResp === "string"
			? accessTokenResp
			: accessTokenResp?.token;

	if (!accessToken) {
		throw new Error("Unable to obtain Gmail access token");
	}

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
	});

	return transporter;
};

/** Envia un correu amb Gmail OAuth2 (reutilitzable) */
export async function sendMail(options: SendMailOptions) {
	const transporter = await createTransport();
	// afegim remitent per defecte si no ve
	if (!options.from) {
		options.from = `MyStore App <${config.googleUser}>`;
	}
	return transporter.sendMail(options);
}
