package org.litlfred.fmlrunner

/**
 * Platform-specific logger implementation
 */
expect class PlatformLogger() {
    fun log(level: String, message: String, data: Any? = null)
}

/**
 * Get platform name
 */
expect fun getPlatformName(): String