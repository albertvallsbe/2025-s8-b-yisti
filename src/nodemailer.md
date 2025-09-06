// import dotenv from "dotenv";
// dotenv.config();
// import nodemailer from "nodemailer";
// import { google } from "googleapis";

// const CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
// const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;
// const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN as string;
// const USER = process.env.GOOGLE_USER as string;

// const REDIRECT_URI = "https://developers.google.com/oauthplayground"; // no importa quin vam usar al principi

// // async..await is not allowed in global scope, must use a wrapper
// export const sendMail = async () => {
// 	// create reusable transporter object using the default SMTP transport

// 	try {
// 		console.log("CLIENT_ID:", CLIENT_ID?.slice(0, 10));
// 		console.log("REFRESH_TOKEN:", REFRESH_TOKEN ? "OK" : "MISSING");

// 		const oAuth2Client = new google.auth.OAuth2(
// 			CLIENT_ID,
// 			CLIENT_SECRET,
// 			REDIRECT_URI,
// 		);

// 		oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// 		const accessToken = await oAuth2Client.getAccessToken();

// 		const transporter = nodemailer.createTransport({
// 			service: "gmail",
// 			auth: {
// 				type: "OAuth2",
// 				user: USER,
// 				clientId: CLIENT_ID,
// 				clientSecret: CLIENT_SECRET,
// 				refreshToken: REFRESH_TOKEN,
// 				accessToken: accessToken.token as string,
// 			},
// 		});

// 		const info = await transporter.sendMail({
// 			from: `MyStore App <${USER}>`,
// 			to: USER,
// 			subject: "Este es un nuevo correo",
// 			text: "Hola santi",
// 			html: "<b>Hola santi</b>",
// 		});

// 		console.log("Message sent: %s", info.messageId);
// 		// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

// 		// Preview only available when sending through an Ethereal account
// 		console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
// 		// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
// 	} catch (error) {
// 		console.error("❌ Error enviant email:", error);
// 	}
// };

// sendMail();
