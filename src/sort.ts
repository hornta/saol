import { readFile, writeFile } from "fs/promises";

// run program: 'npx ts-node-esm ./src/sort.ts'

const file = await readFile("./SAOL_14.txt", { encoding: "utf-8" });
const lines = file.split("\n");
lines.sort((a, b) => {
  return b.length - a.length;
});
await writeFile("./SAOL_14_longest_to_shortest.txt", lines.join("\n"));
