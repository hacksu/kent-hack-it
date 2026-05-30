import { env } from "$env/dynamic/private";
import { betterAuth } from "better-auth";
import { admin } from 'better-auth/plugins';
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "../database/auth-schema";
import { db } from "../database/db";
import { eq } from "drizzle-orm";

/**
 * Check if the user has the KHI admin role to determine
 * admin authentication
 * 
 * @param accessToken 
 * @returns 
 */
async function checkDiscordRole(accessToken: string): Promise<boolean> {
    try {
        const GID = process.env.HACKSU_GUILD_ID ?? env.HACKSU_GUILD_ID;
        const ADM_ROLE = process.env.KHI_ADM_ROLE ?? env.KHI_ADM_ROLE;

        const res = await fetch(`https://discord.com/api/v10/users/@me/guilds/${GID}/member`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const member = await res.json();
        return member.roles?.includes(ADM_ROLE) ?? false;
    } catch (e) {
        console.error('checkDiscordRole error:', e);
        return false;
    }
}

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL ?? env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET ?? env.BETTER_AUTH_SECRET,
    basePath: "/api/auth",
    trustedOrigins: [
        process.env.BETTER_AUTH_URL ?? env.BETTER_AUTH_URL,
        "https://ctf.hacksu.com",
        "https://*.ctf.hacksu.com"
    ],
    plugins: [admin()],
    database: drizzleAdapter(db, {
        provider: "pg",
        schema
    }),
    socialProviders: {
        discord: {
            scope: ["guilds.members.read"],
            clientId: process.env.DISCORD_CLIENT_ID ?? env.DISCORD_CLIENT_ID as string,
            clientSecret: process.env.DISCORD_CLIENT_SECRET ?? env.DISCORD_CLIENT_SECRET as string
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID ?? env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET ?? env.GITHUB_CLIENT_SECRET as string,
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID ?? env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? env.GOOGLE_CLIENT_SECRET as string,
        }
    },
    session: {
        maxAge: 30 * 24 * 60 * 60,
        additionalFields: {
            role: {
                type: "string"
            }
        }
    },
    databaseHooks: {
        session: {
            create: {
                before: async (session) => {
                    const [account] = await db.select()
                        .from(schema.account)
                        .where(eq(schema.account.userId, session.userId))
                        .limit(1);

                    const isAdmin = account?.accessToken
                        ? await checkDiscordRole(account.accessToken)
                        : false;

                    const role = isAdmin ? 'admin' : 'user';
                    await db.update(schema.user)
                        .set({ role })
                        .where(eq(schema.user.id, session.userId));

                    return { data: { ...session, role } };
                }
            }
        }
    }
});

/**
 * performs a server-side check if the user is an admin
 * 
 * @param event named-form actione event
 * @returns 
 */
export async function isAdmin(request: Request): Promise<Boolean> {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        });
        return session?.user.role === 'admin';
    } catch {
        console.log("[-] Error Occurred, assuming user is unauthorized");
        return false;
    }
}