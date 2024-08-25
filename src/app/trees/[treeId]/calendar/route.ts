import * as ics from "ics";
import { NextRequest } from "next/server";

async function getCalendar(events: ics.EventAttributes[]): Promise<string> {
	return new Promise((resolve, reject) => {
		try {
			ics.createEvents(events, (error, value) => {
				if (error) {
					reject(error);
				}
				resolve(value);
			});
		} catch (error) {
			reject(error);
		}
	});
}

export async function GET(request: NextRequest) {
	try {
		const params = new URL(request.url).searchParams;
		const base64EncodedData = params.get("data") ?? "";
		const object = JSON.parse(
			Buffer.from(base64EncodedData, "base64").toString("utf-8")
		);
		const calendar = await getCalendar(object);
		return new Response(calendar, {
			headers: {
				"Content-Type": "text/calendar",
			},
		});
	} catch (error: any) {
		return Response.json(
			{
				success: false,
				error: error?.message ?? "Unknown error occured",
			},
			{ status: 500 }
		);
	}
}
