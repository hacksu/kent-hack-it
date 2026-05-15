import { env } from "$env/dynamic/private"; // dynamic allows the .env file to be read at runtime

export const load = async () => {
    const [month, day, year] = env.EVENT_DATE.split("/").map(Number);
    const start = new Date(year, month - 1, day);
    const end = new Date(year, month - 1, day);
    end.setDate(end.getDate() + Number(env.EVENT_DURATION));

    return {
        eventStartDate: start.toISOString(),
        eventEndDate: end.toISOString(),
    };
};