#!/usr/bin/env node

import { ArgumentParser } from "argparse";
import { update } from "../src/update.js";
import { patch } from "../src/patch.js";

const parser = new ArgumentParser({
  description: 'PCMS Node build helper script'
});

const commands = parser.add_subparsers({ title: "Commands" });

const updateCommand = commands.add_parser("update", { help: "Updates dependencies" });
updateCommand.add_argument("--directory", "-d", { help: "Package directory", default: "." });
updateCommand.set_defaults({ command: update });

const patchCommand = commands.add_parser("patch", { help: "Removes sections of files depending on configuration" });
patchCommand.add_argument("--input", "-i", { help: "Input file name" });
patchCommand.add_argument("--output", "-o", { help: "Output file name" });
patchCommand.add_argument("--remove", "-r", { help: "Comma-delimited list of sections to remove" });
patchCommand.set_defaults({ command: patch });


const parsed = parser.parse_args();
if (parsed.command) {
  parsed.command(parsed);
} else {
  parser.print_help();
}
