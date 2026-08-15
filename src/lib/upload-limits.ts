import { env } from "$env/dynamic/public";

export const MAX_UPLOAD_SIZE_MB = Number(env.PUBLIC_MAX_UPLOAD_SIZE_MB) || 50;
export const MAX_UPLOAD_FILE_SIZE = MAX_UPLOAD_SIZE_MB * 1024 * 1024;
