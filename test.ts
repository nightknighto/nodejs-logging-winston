import logger from "./logger"


logger.profile('test') // first way to start a timer
const profiler = logger.startTimer() // second way to start a timer

logger.log("info", "This is a manual log message")
logger.fatal("This is a fatal message")
logger.error("This is an error message that is only text - notice no stack");
logger.error("", new Error("This is an error message with a stack"))
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
child.error(new Error("This is a child error message"))
child.warn("This is a child warn message")

// throw new Error("This is an error message")