const mkdirp = require('mkdirp');
const path = require('path');
const fs = require('fs');
const CONFIG = require("../../config");
const directoryUtil = require("../../util/directoryUtil");
const GradleUtil = require("../../util/gradleUtil");

// Templates
const bodyTpl = require("./templates/FunctionBody.tpl");
const interfaceTpl = require("./templates/FunctionInterface.tpl");
const requestTpl = require("./templates/FunctionRequest.tpl");
const responseTpl = require("./templates/FunctionResponse.tpl");
const gradleTpl = require("./templates/build.gradle.tpl");
const gitignoreTpl = require("./templates/.gitignore.tpl");
const handlerTpl = require("./templates/handler.tpl");
const handlerGradleTpl = require("./templates/handlerGradle.tpl");
const handlerGitignoreTpl = require("./templates/handlerGitignore.tpl");

const packageName = CONFIG.packageName;
const handlerPackageName = CONFIG.handlerPackageName;

const CreateFunctionModule = {
  createFileWithContents: (path, templateFunction, moduleName, packageName) => {
      return new Promise((resolve, reject) => {
        fs.writeFile(path, templateFunction(moduleName, packageName), function(err) {
            if (err)
                reject();
            resolve();
        });
      });
  },

  createDirectory: (path) => {
    return new Promise((resolve, reject) => {
      mkdirp(path, function(err) {
          if (err) {
            console.error(`Cannot create directory ${moduleName}`, err);
            reject();
          }
          resolve();
      });
    })
  },
  action: (moduleName, cwd = process.cwd()) => {
      // Android module
      const projectPath = directoryUtil.getMccProjectRootDirectory();
      const root = path.join(projectPath, moduleName + CONFIG.moduleSuffix);
      const srcDir = path.join(root, "src/main/java/" + packageName.split(".").join("/"));
      CreateFunctionModule.createDirectory(root)
        .then(() => CreateFunctionModule.createDirectory(srcDir))
        .then(() => CreateFunctionModule.createFileWithContents(path.join(srcDir, `${moduleName}.java`), bodyTpl, moduleName, packageName))
        .then(() => CreateFunctionModule.createFileWithContents(path.join(srcDir, `I${moduleName}.java`), interfaceTpl, moduleName, packageName))
        .then(() => CreateFunctionModule.createFileWithContents(path.join(srcDir, `${moduleName}Response.java`), responseTpl, moduleName, packageName))
        .then(() => CreateFunctionModule.createFileWithContents(path.join(srcDir, `${moduleName}Request.java`), requestTpl, moduleName, packageName))
        .then(() => CreateFunctionModule.createFileWithContents(path.join(root, `build.gradle`), gradleTpl, moduleName, packageName))
        .then(() => CreateFunctionModule.createFileWithContents(path.join(root, `.gitignore`), gitignoreTpl, moduleName, packageName))
        .catch(() => {console.log("ERROR")})

        // Amazon lambda handler

        const handlerRoot = path.join(projectPath, moduleName + CONFIG.moduleSuffix, CONFIG.functionHandlerDir);
        const handlerSrcDir = path.join(handlerRoot, "src/main/java/" + handlerPackageName.split(".").join("/"));
        CreateFunctionModule.createDirectory(handlerRoot)
          .then(() => CreateFunctionModule.createDirectory(handlerSrcDir))
          .then(() => CreateFunctionModule.createFileWithContents(path.join(handlerSrcDir, `${moduleName}Handler.java`), handlerTpl, moduleName, handlerPackageName))
          .then(() => CreateFunctionModule.createFileWithContents(path.join(handlerRoot, `build.gradle`), handlerGradleTpl, moduleName, handlerPackageName))
          .then(() => CreateFunctionModule.createFileWithContents(path.join(handlerRoot, `.gitignore`), handlerGitignoreTpl, moduleName, handlerPackageName))
          .catch((e) => {console.log(e)})

        GradleUtil.appendModuleToMainProject(moduleName + CONFIG.moduleSuffix);
        GradleUtil.appendModuleToMainProject(moduleName + CONFIG.moduleSuffix + ":" + CONFIG.functionHandlerDir);
  }

}

module.exports = CreateFunctionModule;
