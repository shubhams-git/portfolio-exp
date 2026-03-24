export type AppLogger = Pick<Console, "info" | "warn" | "error">;

export const defaultLogger: AppLogger = console;
