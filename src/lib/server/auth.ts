import { env } from "$env/dynamic/private";
import { betterAuth } from "better-auth";

import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "../database/auth-schema";
import { db } from "../database/db";

export const auth = betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    basePath: "/api/auth", // for oauth redirection the path format is /api/auth/callback/[provider]
    trustedOrigins: [
        env.BETTER_AUTH_URL,
        "https://ctf.hacksu.com",
        "https://*.ctf.hacksu.com"
    ],
    database: drizzleAdapter(db, {
        provider: "pg",
        schema  // generated via npx auth@latest generate the auth-schema file
    }),
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "user",
                required: false,
                input: false
            }
        }
    },
    socialProviders: {
        discord: {
            scope: ["guilds.members.read"],
            clientId: env.DISCORD_CLIENT_ID as string,
            clientSecret: env.DISCORD_CLIENT_SECRET as string
        }
    },

    session: {
        maxAge: 30 * 24 * 60 * 60
    }
});