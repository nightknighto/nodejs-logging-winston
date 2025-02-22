import winston, { format } from "winston";
import { transformLogInfo, formatLogMessage } from './formatters';

/**
 * Custom log levels and their colors
 */
const logLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        debug: 4,
        trace: 5,
    },
    colors: {
        fatal: "bold red",
        error: "red",
        warn: "yellow",
        info: "green",
        debug: "blue",
        trace: "cyan",
    }
} as const;

/*
 * log message styling options
 * Font styles: bold, dim, italic, underline, inverse, hidden, strikethrough
 * Font foreground colors: black, red, green, yellow, blue, magenta, cyan, white, gray, grey
 * Font background colors: blackBG, redBG, greenBG, yellowBG, blueBG, magentaBG, cyanBG, whiteBG
 * Note: can't leave empty. Use "dim" to indicate no styling.
*/

/**
 * Custom log message parts and their syling
 */
const coloredParts = {
    label: "green",
    timestamp: "white",
    level: "dim", // cant leave empty. Use dim to indicate nothing
    message: "dim", // cant leave empty. Use dim to indicate nothing
    durationMs: "italic magenta",
    service: "yellow"
} as const;

// add custom log level colors to winston to use globally
winston.addColors(logLevels.colors)

// or make a colorizer instance with the custom colors and use it in the log message formatter directly
/**
 * Colorizer instance with custom colors for log message parts
 */
const logPartsColorizer = winston.format.colorize({
    colors: coloredParts
})

const logger = winston.createLogger({
    levels: logLevels.levels, // override the default log levels with custom log levels
    level: "trace", // set the maximum log level priority to output. Any log level with index higher than this will not be output.
    transports: [
        new winston.transports.Console({
            handleExceptions: true, // output exceptions to the console
            handleRejections: true, // output rejections to the console
        }),
        new winston.transports.File({ filename: "combined.log" }), // output all logs to a file
        new winston.transports.File({ filename: "error.log", level: "warn" }) // output only logs with level "warn" and higher to a file
    ],
    exceptionHandlers: [new winston.transports.File({ filename: "exceptions.log" })], // output exceptions to a file
    rejectionHandlers: [new winston.transports.File({ filename: "rejections.log" })], // output rejections to a file
    // exitOnError: false, // do not exit the process on error
}) as winston.Logger
    & Record<keyof typeof logLevels.levels, winston.LeveledLogMethod> // define the new log level functions to the logger. These functions are automatically implemented when using custom log levels
    & { verbose: never, silly: never, http: never } // prevent usage of the default log level functions because they are no longer implemented after using custom log levels

logger.format = format.combine(
    format.timestamp({ format: "DD/MM/YYYY, h:mm:ss A" }), // add a timestamp to the log message. See https://github.com/taylorhakes/fecha?tab=readme-ov-file#formatting-tokens for formatting options
    format.label({ label: "Main" }), // add a label field to the log message
    transformLogInfo(logger)(), // transform the log message info or filter it. Like a middleware
    winston.format.colorize({ all: true }), // add the predefined log level colors to the logs. Put at the bottom to colorize the entire log line
    formatLogMessage(logPartsColorizer), // create a custom log message format, possibly with custom colors
),

logger.profile('test') // first way to start a timer
const profiler = logger.startTimer() // second way to start a timer

logger.fatal("This is a fatal message")
logger.error("This is an error message")
logger.warn("This is a warning message")
logger.info("This is an info message")
logger.debug("This is a debug message")
logger.trace("This is a trace message")
// logger.verbose("This is a verbose message") // verbose is not implemented due to custom log levels.
// logger.silly("This is a silly message") // same.
// logger.http("This is an http message") // same. typescript should throw an error if you try to use these functions
logger.debug("This is a debug message", { private: true })

logger.profile('test', { level: "debug", message: "This is a profile message" })
profiler.done({ message: "This is a profile timer end", level: "trace" })

const child = logger.child({
    service: "user-service", context: {
        request: "GET /user",
        userId: 1
    }
})

child.info("This is a child info message")
child.error("This is a child error message")
child.warn("This is a child warn message")

throw new Error("This is an error message")