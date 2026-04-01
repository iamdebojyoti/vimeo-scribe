plugins {
    base
}

val buildReact by tasks.registering(Exec::class) {
    group = "build"
    description = "Build the React app using npm"

    workingDir = projectDir
    inputs.files("package.json", "package-lock.json")
    inputs.dir("src")
    outputs.dir("$projectDir/dist")

    // Install deps then build
    commandLine("sh", "-c", "npm install && npm run build")
}

tasks.named("build") {
    dependsOn(buildReact)
}

tasks.named("clean") {
    doLast {
        delete("$projectDir/dist")
        delete("$projectDir/node_modules")
    }
}