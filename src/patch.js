import fs from "fs";

const open = /<([^>/]+)>/;
const close = /<\/([^>]+)>/;

function patchText(input, removeSections) {
  const output = [];
  let pos = 0;
  while (true) {
    while (pos < input.length && !input[pos].match(open)) {
      output.push(input[pos++]);
    }
    if (pos >= input.length) {
      break;
    }
    const name = input[pos].match(open)[1];
    if (removeSections.has(name)) {
      pos++;
      while (pos < input.length && !(input[pos].match(close) && input[pos].match(close)[1] === name)) {
        pos++;
      }
      pos++;
    } else {
      output.push(input[pos++]);
    }
  }
  return output;
}

export function patch({input, output, remove}) {
  const removeSections = new Set(remove.split(","));
  const text = fs.readFileSync(input, { encoding: "utf8" }).split("\n");
  const processed = patchText(text, removeSections);
  fs.writeFileSync(output, processed.join("\n"), { encoding: "utf8" });
}
