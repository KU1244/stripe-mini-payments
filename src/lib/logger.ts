export function logInfo(event: string, data: Record<string, unknown> = {}) {
    console.log(JSON.stringify({ level: "info", event, ...data }));
}
export function logError(event: string, data: Record<string, unknown> = {}) {
    console.error(JSON.stringify({ level: "error", event, ...data }));
}
