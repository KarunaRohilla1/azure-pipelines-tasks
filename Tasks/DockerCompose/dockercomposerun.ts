"use strict";

import * as tl from "vsts-task-lib/task";
import DockerComposeConnection from "./dockercomposeconnection";

export function run(connection: DockerComposeConnection): any {
    var command: any = connection.createComposeCommand();
    command.arg("run");

    var detached = tl.getBoolInput("detached");
    if (detached) {
        command.arg("-d");
    }

    var entrypoint = tl.getInput("entrypoint");
    if (entrypoint) {
        command.arg(["--entrypoint", entrypoint]);
    }

    var containerName = tl.getInput("containerName");
    if (containerName) {
        command.arg(["--name", containerName]);
    }

    tl.getDelimitedInput("ports", "\n").forEach(port => {
        command.arg(["-p", port]);
    });

    if (!detached) {
        command.arg("--rm");
    }

    command.arg("-T");

    var workDir = tl.getInput("workDir");
    if (workDir) {
        command.arg(["-w", workDir]);
    }

    var serviceName = tl.getInput("serviceName", true);
    command.arg(serviceName);

    var containerCommand = tl.getInput("containerCommand");
    if (containerCommand) {
        command.line(containerCommand);
    }

    var promise = connection.execCommand(command);

    if (!detached) {
        promise = promise.fin(() => {
            var downCommand: any = connection.createComposeCommand();
            downCommand.arg("down");
            return connection.execCommand(downCommand);
        });
    }

    return promise;
}
