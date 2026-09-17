import { GetEventDate } from "$lib/utilities";

export const load = async () => {
    const eventData = await GetEventDate();

    return {
        eventStartDate: eventData.start?.toISOString(),
        eventEndDate: eventData.end?.toISOString(),
    };
};