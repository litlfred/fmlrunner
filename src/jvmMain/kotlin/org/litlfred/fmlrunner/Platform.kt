package org.litlfred.fmlrunner

/**
 * JVM platform-specific implementations
 */
actual class PlatformLogger {
    actual fun log(level: String, message: String, data: Any?) {
        val timestamp = java.time.LocalDateTime.now()
        val logMessage = "[$timestamp] ${level.uppercase()}: $message"
        when (level.uppercase()) {
            "ERROR" -> System.err.println("$logMessage ${data ?: ""}")
            else -> println("$logMessage ${data ?: ""}")
        }
    }
}

actual fun getPlatformName(): String = "JVM"