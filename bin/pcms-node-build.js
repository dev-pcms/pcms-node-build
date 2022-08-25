#!/usr/bin/env node

import { ArgumentParser } from "argparse";
import { update } from "../src/update.js";
import { eta } from "../src/eta.js";

const parser = new ArgumentParser({
  description: 'PCMS Node build helper script'
});

const commands = parser.add_subparsers({ title: "Commands" });

const updateCommand = commands.add_parser("update", { help: "Updates dependencies" });
updateCommand.add_argument("--directory", "-d", { help: "Package directory", default: "." });
updateCommand.set_defaults({ command: update });

const etaCommand = commands.add_parser("eta", { help: "Generates file using Eta" });
etaCommand.add_argument("--template", "-t", { help: "Template filename", metavar: "file", required: true});
etaCommand.add_argument("--output", "-o", { help: "Output file name", metavar: "file", required: false });
etaCommand.add_argument("--set", "-s", { help: "Sets template variables",  metavar: "variable=value", nargs: "+"});
etaCommand.set_defaults({ command: eta });


const parsed = parser.parse_args();
if (parsed.command) {
  parsed.command(parsed);
} else {
  parser.print_help();
}
