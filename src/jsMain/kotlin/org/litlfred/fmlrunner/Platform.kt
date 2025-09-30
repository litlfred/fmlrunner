package org.litlfred.fmlrunner

/**
 * JavaScript platform-specific implementations
 */
actual class PlatformLogger {
    actual fun log(level: String, message: String, data: Any?) {
        when (level.uppercase()) {
            "ERROR" -> console.error(message, data)
            "WARN" -> console.warn(message, data)
            "INFO" -> console.info(message, data)
            "DEBUG" -> console.log(message, data)
            else -> console.log(message, data)
        }
    }
}

actual fun getPlatformName(): String = "JavaScript"