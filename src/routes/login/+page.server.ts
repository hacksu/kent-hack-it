import { auth } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { SocialProvider } from "better-auth/social-providers";

type Provider = {
    name: string;
    icon: string,
    provider: SocialProvider
}
const PROVIDERS: Provider[] = [
    {
        icon: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/discord.svg",
        name: "Discord",
        provider: "discord"
    },
    {
        icon: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/github.svg",
        name: "Github",
        provider: "github"
    },
    {
        icon: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/google.svg",
        name: "Google",
        provider: "google"
    },
]

export const load: PageServerLoad = async ({ request }) => {
    const session = await auth.api.getSession(request);
    if (session) {
        throw redirect(301, "/profile");
    }

    return { providers: PROVIDERS };
};