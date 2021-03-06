const CONFIG = require("../../../config");

module.exports = (moduleName, packageName) =>
`apply plugin: 'java'

repositories {
    mavenCentral()
}

dependencies {
    compile (
            'com.amazonaws:aws-lambda-java-core:1.1.0',
            'com.amazonaws:aws-lambda-java-events:1.1.0',
            fileTree(dir: 'lib', include: ['*.jar'])

    )
    compile project(path: ':mcclib')
    compile project(path: ':${moduleName}${CONFIG.moduleSuffix}')
}

task buildZip(type: Zip) {
    from compileJava
    from processResources
    into('lib') {
        from configurations.runtime
    }
}

build.dependsOn buildZip
`
