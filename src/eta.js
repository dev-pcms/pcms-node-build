import * as fs from "fs";
import * as Eta from "eta";

function assert(condition, message) {
  if (!condition) {
    throw Error(message)
  }
}

function parseSet(arg) {
  const eqIndex = arg.indexOf("=");
  assert(eqIndex >= 0, `Invalid argument to --set: ${arg}"`);
  return [arg.substring(0, eqIndex), arg.substring(eqIndex + 1)];
}

export function eta({template: templateFile, output: outFile, set}) {
  const dotIndex = templateFile.lastIndexOf('.');
  const outputFile = outFile || templateFile.substring(0, dotIndex >= 0 ? dotIndex : templateFile.length);
  assert(templateFile !== outputFile, `Template and output files are the same: "${templateFile}"`);

  const data = Object.fromEntries((set || []).map((arg) => parseSet(arg)));

  const template = fs.readFileSync(templateFile, { encoding: "utf8" });
  const output = Eta.render(template, data);
  fs.writeFileSync(outputFile, output, { encoding: "utf8" });
}
