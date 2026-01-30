
export function calculateRemainingTime(
    startedAt: Date,
    durationSeconds: number,
    currentServerTime: Date = new Date()
): number {
    const startTime = startedAt.getTime();
    const endTime = startTime + durationSeconds * 1000;
    const currentTime = currentServerTime.getTime();
    const remainingMs = Math.max(0, endTime - currentTime);
    const remainingSeconds = Math.floor(remainingMs / 1000);
    return remainingSeconds;
}


export function isPollExpired(
    startedAt: Date,
    durationSeconds: number,
    currentServerTime: Date = new Date()
): boolean {
    return calculateRemainingTime(startedAt, durationSeconds, currentServerTime) === 0;
}


export function getPollEndTime(startedAt: Date, durationSeconds: number): Date {
    return new Date(startedAt.getTime() + durationSeconds * 1000);
}
