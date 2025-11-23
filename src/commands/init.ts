import { Command } from "commander";

export function initCommand(): Command {
  const command = new Command("init");

  command
    .description("Initialize a new project")
    .action(() => {
      console.log("test");
    });

  return command;
}

