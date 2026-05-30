import { auth } from "$lib/server/auth";

export const GET = (event) => auth.handler(event.request);
export const POST = (event) => auth.handler(event.request);