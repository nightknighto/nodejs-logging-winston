import winston, { format } from 'winston';
import { devFormatLogMessage, transformLogInfo } from './formatters';
import { logLevels, logPartsColorizer } from './log-levels';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Extends the Winston Logger type with custom log level methods while removing default log levels.
 *
 * The type ensures that:
 * 1. All custom log levels defined in logLevels.levels are available as methods
 * 2. Default Winston log levels (verbose, silly, http) are explicitly removed
 */
type CustomLogger = winston.Logger &
    Record<keyof typeof logLevels.levels, winston.LeveledLogMethod> & {
        // define the new log level functions to the logger. These functions are automatically implemented when using custom log levels
        verbose: never;
        silly: never;
        http: never;
    }; // prevent usage of the default log level functions because they are no longer implemented after using custom log levels

const logger = winston.createLogger({
    levels: logLevels.levels, // override the default log levels with custom log levels
    level: isProduction ? 'info' : 'trace', // set the maximum log level priority to output. Any log level with index higher than this will not be output.
    exceptionHandlers: [new winston.transports.File({ filename: 'exceptions.log' })],
    rejectionHandlers: [new winston.transports.File({ filename: 'rejections.log' })],
    // exitOnError: false, // do not exit the process on error
}) as CustomLogger;

const developmentFormat = format.combine(
    format.errors({ stack: true }), // add the error stack trace to the log message
    format.timestamp({ format: 'DD/MM/YYYY, h:mm:ss A' }), // add a timestamp to the log message. See https://github.com/taylorhakes/fecha?tab=readme-ov-file#formatting-tokens for formatting options
    format.label({ label: 'Main' }), // add a label field to the log message. While it seems redundant due to defaultMeta, only this works for profile methods. Leave it for now.
    transformLogInfo(logger)(), // transform the log message info or filter it. Like a middleware
    devFormatLogMessage(logPartsColorizer), // create a custom log message format, possibly with custom colors
    winston.format.colorize({ all: true }), // add the predefined log level colors to the logs. Put at the bottom to colorize the entire log line
);

const prodFormat = format.combine(
    format.errors({ stack: true }), // add the error stack trace to the log message
    format.timestamp(),
    format.label({ label: 'Main' }),
    transformLogInfo(logger)(),
    format.json(), // output the log message as json
);

let consoleFormat: winston.Logform.Format;
let fileFormat: winston.Logform.Format;

if (isProduction) {
    consoleFormat = prodFormat;
    fileFormat = prodFormat;
} else {
    consoleFormat = developmentFormat;
    fileFormat = format.combine(developmentFormat, format.uncolorize()); // remove colors from the log message
}

logger.add(
    new winston.transports.Console({
        format: consoleFormat,
        handleExceptions: true, // output exceptions to the console
        handleRejections: true, // output rejections to the console
    }),
);

logger.add(new winston.transports.File({ filename: 'combined.log', format: fileFormat })); // output all logs to a file
logger.add(
    new winston.transports.File({ filename: 'error.log', level: 'warn', format: fileFormat }),
); // output only logs with level "warn" and higher to a file

export default logger;