import fetch, { FormData } from "node-fetch";
import { parse } from "node-html-parser";

export interface Word {
  link: string;
  plainWord: string;
  id: string;
  class: string;
}

export type ScrapeOptionsWordsHandler = (words: Word[]) => {};
export type ScrapeOptionsFinishHandler = () => {};

export interface ScrapeOptions {
  fromId: string;
  onWords: ScrapeOptionsWordsHandler;
  onFinish: ScrapeOptionsFinishHandler;
}

const url = "https://svenska.se/wp-admin/admin-ajax.php";

export const scrape = async ({ fromId, onWords, onFinish }: ScrapeOptions) => {
  let lastWordId = fromId;
  while (true) {
    var formData = new FormData();
    formData.append("action", "myprefix_scrollist");
    formData.append("unik", lastWordId);
    formData.append("dir", "ned");
    formData.append("dict", "saol");

    const response = await fetch(url, { method: "POST", body: formData });
    const textResponse = await response.text();
    const root = parse(textResponse);
    const links = root.querySelectorAll(".slank");

    let words: Word[] = [];
    for (const link of links) {
      const wordUrl = link.getAttribute("href")?.trim();
      const plainWord = link.querySelector(".plain")?.text.trim();
      const id = wordUrl?.slice(
        wordUrl.indexOf("?id=") + 4,
        wordUrl.indexOf("&pz=")
      );
      const className = link.querySelector(".wordclass")?.text.trim();

      if (
        wordUrl === undefined ||
        plainWord === undefined ||
        id === undefined ||
        className === undefined
      ) {
        throw new Error("Some data is missing in link " + link);
      }

      const word: Word = {
        class: className,
        id,
        link: wordUrl,
        plainWord,
      };
      words.push(word);
    }
    await onWords(words);

    const nextLastWordId = words.at(-1)!.id;
    if (nextLastWordId === lastWordId) {
      await onFinish();
      break;
    } else {
      lastWordId = nextLastWordId;
    }
  }
};
