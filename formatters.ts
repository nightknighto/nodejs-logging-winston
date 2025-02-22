import winston, { format } from "winston";

/**
 * Log Info middleware. Used to filter or modify log information before being passed on to the next function.
 * @param logger - Winston logger instance: to create additional logs if needed
 * @returns Winston format instance
 */
export const transformLogInfo = (logger: winston.Logger) => format((info) => {
    if (info.private) {
        logger.log(info.level, "Redacted message");
        return false; // return false to filter out the log message
    }
    if(info.exception && info.level === 'error') {
        logger.log("fatal", info); // log the exception as a fatal error
        return false;
    }
    info.level = info.level.toUpperCase();
    return info; // dont forget to return the info object
});

/**
 * Custom log message format. This function is used to format the log message in a custom way.
 * It can be used to add colors to the log message.
 * @param colorizer - Winston colorizer instance
 * @returns Winston format instance
 */
export const formatLogMessage = (colorizer: winston.Logform.Colorizer) => {
    return format.printf((info) => {
        const {
            timestamp,
            label,
            level,
            message,
            durationMs,
            service = "default",
            context,
            // ...rest
        } = info;

        // Format each part with colors
        const parts = {
            timestamp: colorizer.colorize("timestamp", `[${timestamp}]`),
            label: colorizer.colorize("label", `[${label}]`),
            level: colorizer.colorize("level", level),
            message: colorizer.colorize("message", message as string),
            duration: durationMs ? colorizer.colorize("durationMs", `(took ${durationMs}ms)`) : "",
            service: colorizer.colorize("service", `[${service}]`),
            context: context ? JSON.stringify(context, null, 2) : "",
            // metadata: Object.keys(rest).length ? JSON.stringify(rest, null, 2) : ""
        };

        return `${parts.label}  -  ${parts.timestamp}   ${parts.service} ${parts.level} - ${parts.message} ${parts.duration} ${parts.context}`;
    })
};
