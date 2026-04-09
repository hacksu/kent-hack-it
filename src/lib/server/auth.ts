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
        const res = await fetch(`https://discord.com/api/v10/users/@me/guilds/${env.HACKSU_GUILD_ID}/member`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const member = await res.json();
        return member.roles?.includes(env.KHI_ADM_ROLE) ?? false;
    } catch (e) {
        console.error('checkDiscordRole error:', e);
        return false;
    }
}

export const auth = betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    basePath: "/api/auth",
    trustedOrigins: [
        env.BETTER_AUTH_URL,
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
            clientId: env.DISCORD_CLIENT_ID as string,
            clientSecret: env.DISCORD_CLIENT_SECRET as string
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

                    if (!account?.accessToken) return { data: session };

                    const isAdmin = await checkDiscordRole(account.accessToken);
                    const role = isAdmin ? 'admin' : 'user';

                    await db.update(schema.user)
                        .set({ role })
                        .where(eq(schema.user.id, session.userId));

                    return { data: session };
                }
            }
        }
    }
});