import type winston from 'winston';
import { format } from 'winston';

/**
 * Log Info middleware. Used to filter or modify log information before being passed on to the next function.
 * @param logger - Winston logger instance: to create additional logs if needed
 * @returns Winston format instance
 */
export const transformLogInfo = (logger: winston.Logger) =>
    format((info) => {
        if (info.exception && info.level === 'error') {
            // check if the log message is an exception
            logger.log('fatal', info); // log the exception as a fatal error
            return false; // return false to filter out the log message
        }
        info.level = info.level.toUpperCase();
        return info; // dont forget to return the info object
    });

/**
 * Custom log message format for development. This function formats the log message in an easy-to-read format.
 * @param colorizer - Winston colorizer instance with colors for log message parts
 * @returns Winston format instance
 */
export const devFormatLogMessage = (colorizer: winston.Logform.Colorizer) => {
    return format.printf((info) => {
        const {
            timestamp,
            label,
            level,
            message,
            durationMs,
            service = 'default',
            // context,
            // stack,
            ...rest
        } = info;

        // Format each part with colors
        const parts = {
            timestamp: colorizer.colorize('timestamp', `[${timestamp}]`),
            label: colorizer.colorize('label', `[${label}]`),
            level: colorizer.colorize('level', level),
            message: colorizer.colorize('message', message as string),
            duration: durationMs ? colorizer.colorize('durationMs', `(took ${durationMs}ms)`) : '',
            service: colorizer.colorize('service', `[${service}]`),
            // context: context ? JSON.stringify(context, null, 2) : '',
            metadata: Object.keys(rest).length ? `\n${JSON.stringify(rest, null, 2)}` : '',
        };

        // return `${parts.label}  -  ${parts.timestamp}   ${parts.service} ${parts.level} - ${parts.message} ${parts.duration} ${parts.context} ${stack ? `\n${stack}` : ''}`;
        return `${parts.label}  -  ${parts.timestamp}   ${parts.service} ${parts.level} - ${parts.message} ${parts.duration} ${parts.metadata}`;
    });
};
