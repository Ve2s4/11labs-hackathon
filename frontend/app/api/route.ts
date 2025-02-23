import { AccessToken, type VideoGrant } from "livekit-server-sdk";
import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const LIVEKIT_URL = process.env.LIVEKIT_URL;
		const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
		const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;

		const participantIdentity = `voice_assistant_user_${randomUUID()}`;
		const roomName = `voice_assistant_room_${randomUUID()}`;

		const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
			identity: participantIdentity,
			ttl: "10m",
		});
		const grant: VideoGrant = {
			room: roomName,
			roomJoin: true,
			canPublish: true,
			canPublishData: true,
			canSubscribe: true,
			canUpdateOwnMetadata: true,
		};
		at.addGrant(grant);
		const participantToken = await at.toJwt();

		const data = {
			serverUrl: LIVEKIT_URL,
			roomName,
			participantToken: participantToken,
			participantName: participantIdentity,
		};

		const response = NextResponse.json(data);
		response.cookies.set("session", participantToken, {
			httpOnly: true,
			maxAge: 600,
		});
		return response;
	} catch (error) {
		return NextResponse.json(
			{ message: "Something went wrong!, couldn't able to issue an authentication token" },
			{ status: 500 }
		);
	}
}