import { NextResponse } from "next/server";

function disabledAuthResponse() {
	return NextResponse.json(
		{ error: "Authentication is disabled in this deployment." },
		{ status: 410 },
	);
}

export async function GET() {
	return disabledAuthResponse();
}

export async function POST() {
	return disabledAuthResponse();
}
