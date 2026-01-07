pluginManagement {
    plugins {
        id("org.jetbrains.kotlin.android") version "1.9.24"
        id("org.jetbrains.kotlin.kapt") version "1.9.24"
    }
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "ScolabStudentApp"
include(":app")

// Suppression du bloc qui force le JDK via javaHome car cette API n'est pas disponible ici.
// Pour utiliser le JDK embarqué, configure JAVA_HOME dans l'environnement ou via Android Studio.
