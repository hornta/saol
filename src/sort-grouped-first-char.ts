import { readFile, writeFile } from "fs/promises";

// run program: 'npx ts-node-esm ./src/sort-grouped-first-char.ts'

const file = await readFile("./SAOL_14.txt", { encoding: "utf-8" });
const words = file.split("\n");

const wordsByFirstChar = words.reduce<Record<string, string[]>>((acc, word) => {
  const firstChar = word[0]!;
  if (!Array.isArray(acc[firstChar])) {
    acc[firstChar] = [];
  }
  acc[firstChar]!.push(word);
  return acc;
}, {});

const sortedGroupList: string[][] = [];

for (var key of Object.keys(wordsByFirstChar)) {
  if (Object.prototype.hasOwnProperty.call(wordsByFirstChar, key)) {
    const wordList = wordsByFirstChar[key]!;
    wordList.sort((a, b) => {
      return b.length - a.length;
    });
    sortedGroupList.push(wordList);
  }
}

sortedGroupList.sort((a, b) => {
  return a[0]!.localeCompare(b[0]!, "sv");
});

await writeFile(
  "./SAOL_14_longest_to_shortest_grouped_first_char.txt",
  sortedGroupList.flat().join("\n")
);

await writeFile(
  "./SAOL_14_longest_to_shortest_longest_word_per_character.txt",
  sortedGroupList
    .map((wordList) => {
      return wordList[0];
    })
    .flat()
    .join("\n")
);
