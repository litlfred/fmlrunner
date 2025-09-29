plugins {
    kotlin("multiplatform") version "2.1.0"
    kotlin("plugin.serialization") version "2.1.0"
}

group = "org.litlfred.fmlrunner"
version = "0.1.0"

repositories {
    mavenCentral()
    // JitPack repository for kotlin-fhirpath dependency  
    // Note: JitPack access still blocked by network firewall
    // maven("https://jitpack.io")
}

// Configure JVM toolchain at the project level
java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(11))
    }
}

kotlin {
    jvm {
        testRuns["test"].executionTask.configure {
            useJUnitPlatform()
        }
    }
    
    js(IR) {
        browser {
            testTask {
                useKarma {
                    useChromeHeadless()
                    webpackConfig.cssSupport {
                        enabled.set(true)
                    }
                }
            }
        }
        nodejs {
            testTask {
                useMocha {
                    timeout = "10s"
                }
            }
        }
        binaries.executable()
        
        // Configure JS output for consumption by Node.js/TypeScript
        compilations.getByName("main") {
            packageJson {
                // Remove custom type field to avoid ES module issues
            }
        }
        
        useCommonJs() // Use CommonJS for better Node.js compatibility
    }
    
    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")
                implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.4.1")
                // kotlin-fhirpath dependency from https://github.com/jingtang10/kotlin-fhirpath
                // Note: JitPack access still blocked - will integrate when network allows
                // implementation("com.github.jingtang10:kotlin-fhirpath:0.1.0")
            }
        }
        
        val commonTest by getting {
            dependencies {
                implementation(kotlin("test"))
            }
        }
        
        val jvmMain by getting {
            dependencies {
                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
                // kotlin-fhirpath provides JVM implementation
            }
        }
        
        val jvmTest by getting {
            dependencies {
                implementation("org.junit.jupiter:junit-jupiter:5.9.3")
            }
        }
        
        val jsMain by getting {
            dependencies {
                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
                // kotlin-fhirpath provides JS implementation
            }
        }
        
        val jsTest by getting {
            dependencies {
                implementation(kotlin("test-js"))
            }
        }
    }
}