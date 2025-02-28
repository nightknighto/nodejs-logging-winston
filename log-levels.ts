import winston from "winston";

/**
 * Custom log levels and their colors
 */
export const logLevels = {
    levels: {
        fatal: 0, // indicates a fatal error that stops the application
        error: 1, // indicates an error that needs to be fixed
        warn: 2, // indicates a warning that should be checked
        info: 3, // general information or usage of the application
        debug: 4, // debug information for developers
        trace: 5, // detailed trace information for developers
    },
    colors: {
        fatal: 'bold red',
        error: 'red',
        warn: 'yellow',
        info: 'green',
        debug: 'blue',
        trace: 'cyan',
    },
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
export const coloredParts = {
    label: 'green',
    timestamp: 'white',
    level: 'dim', // cant leave empty. Use dim to indicate nothing
    message: 'dim', // cant leave empty. Use dim to indicate nothing
    durationMs: 'italic magenta',
    service: 'yellow',
} as const;

// add custom log level colors to winston to use globally
winston.addColors(logLevels.colors);

// or make a colorizer instance with the custom colors and use it in the log message formatter directly
/**
 * Colorizer instance with custom colors for log message parts
 */
export const logPartsColorizer = winston.format.colorize({
    colors: coloredParts,
});
