import { GetConfiguration } from "$lib/database/db";

export const load = async () => {
    const config = await GetConfiguration();
    if (!config) return {};

    const start = new Date(config.event_start);
    const end = new Date(config.event_start);
    end.setDate(end.getDate() + config.event_length);

    return {
        eventStartDate: start.toISOString(),
        eventEndDate: end.toISOString(),
    };
};