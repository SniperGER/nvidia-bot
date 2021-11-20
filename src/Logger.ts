export enum LogLevel {
	DEBUG,
	INFO,
	WARN,
	ERROR,
	FATAL,
	HTTP
}

export default class Logger {
	public static Log(category: string, content: string, level: LogLevel = LogLevel.INFO) {
		console.log(`${levelFormatter[level]} [${new Date().toISOString()}] [\x1b[1m${category}\x1b[0m] ${content}`);
	}
}

const levelFormatter: { [level: number]: string } = {
	[LogLevel.DEBUG]: "\x1b[36m[DEBUG]\x1b[0m",
	[LogLevel.INFO]: "\x1b[34m[INFO]\x1b[0m",
	[LogLevel.WARN]: "\x1b[33m[WARN]\x1b[0m",
	[LogLevel.ERROR]: "\x1b[31m[ERROR]\x1b[0m",
	[LogLevel.FATAL]: "\x1b[41m[FATAL]\x1b[0m",
	[LogLevel.HTTP]: "\x1b[32m[HTTP]\x1b[0m"
}