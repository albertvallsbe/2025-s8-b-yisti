import dotenv from "dotenv";
dotenv.config();
import { google } from "googleapis";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/oauth2callback";

const temporalToken =
	"4/0AVMBsJjvN-SjNeX6EPCOKiRZAJ1BOyqJ7FQIWMlar9F0EFiR_gvxqmIL5fM9IN_kNcZScA";

const oauth2Client = new google.auth.OAuth2(
	CLIENT_ID,
	CLIENT_SECRET,
	REDIRECT_URI,
);

// First part! Second part must be commented!

// const SCOPES = ["https://mail.google.com/"];

// const url = oauth2Client.generateAuthUrl({
// 	access_type: "offline",
// 	scope: SCOPES,
// });

// console.log("👉 Obre aquesta URL al navegador i dona permís:");
// console.log(url);

// End first part!

// Second part! First part must be commented!

async function getToken() {
	const { tokens } = await oauth2Client.getToken(temporalToken);
	console.log("Access Token:", tokens.access_token);
	console.log("Refresh Token:", tokens.refresh_token);
	console.log("Tokens complets:", tokens);
}

getToken().catch(console.error);

// End second part!
