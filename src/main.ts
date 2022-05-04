import "dotenv/config";
import { writeFile } from "fs/promises";
import { MongoClient } from "mongodb";
import { scrape, Word } from "./scraper.js";

const client = new MongoClient(process.env["MONGO_CONNECTION_STRING"]!);
await client.connect();
const database = client.db(process.env["MONGO_WORD_DATABASE"]!);
const wordCollection = database.collection<Word>(
  process.env["MONGO_WORD_COLLECTION"]!
);

const lastWord = await wordCollection.findOne({}, { sort: { id: -1 } });

await scrape({
  fromId: lastWord?.id || "0000004",
  async onWords(words) {
    await wordCollection.bulkWrite(
      words.map((word) => {
        return {
          replaceOne: {
            filter: { id: word.id },
            replacement: word,
            upsert: true,
          },
        };
      })
    );
    console.log("Saved " + words.length + " word(s)...");
  },
  async onFinish() {
    const cursor = await wordCollection.find({}, { sort: { id: 1 } });
    const documents = await cursor.toArray();
    const words = documents.map((word) => {
      return word.plainWord;
    });
    await writeFile("SAOL_14.txt", words.join("\n"));
    await client.close();
  },
});
