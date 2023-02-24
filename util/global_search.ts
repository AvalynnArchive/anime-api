import * as utils from "./util";
import * as constants_global from "./constants_global";
import levenshtein from "js-levenshtein";

interface Options {
  website?: string[];
  limit_per_website?: number;
}

interface ScrapLinkObject {
  source: string;
  title: string;
  link: string;
  levenshtein: number;
}

type ScrapLinkFunction = (
  website: string,
  selectorAll: string,
  cleanTitle: { BRACKET?: boolean },
  doc: Document,
  search: string,
  selectorTitle?: string | null
) => ScrapLinkObject[];

interface SearchFunction {
  (
    website: string,
    url: string,
    search: string,
    options: Options,
    fn: ScrapLinkFunction,
    dom?: boolean,
    space?: string | null
  ): Promise<ScrapLinkObject[]>;
}

export const search: SearchFunction = async (
  website: string,
  url: string,
  search: string,
  options: Options,
  fn: ScrapLinkFunction,
  dom = true,
  space = null
) => {
  if (options.website && !options.website.includes(website)) {
    return [];
  }

  const doc = await utils.search(url, search, dom, space);
  if (doc !== null) {
    const objectsScrapped = fn(website, search);
    const objectsScrappedOptionned = utils.apply_options(
      objectsScrapped,
      options
    );
    return objectsScrappedOptionned;
  }

  return [];
};

export const scrap_link: ScrapLinkFunction = (
  website: string,
  selectorAll: string,
  cleanTitle: { BRACKET?: boolean },
  doc: Document,
  search: string,
  selectorTitle: string | null = null
) => {
  const elements = [...doc.querySelectorAll(selectorAll)];
  const objectsScrapped = elements.map((element, index) => {
    const objectScrapped: ScrapLinkObject = {
      source: website,
      title: "",
      link: "",
      levenshtein: 0,
    };
    const title = selectorTitle
      ? element.querySelector(selectorTitle)
      : element;
    objectScrapped.title = title.innerHTML
      ? title.innerHTML
      : constants_global.GLOBAL_NO_DATA;
    objectScrapped.title = utils.clean_title(objectScrapped.title, cleanTitle);
    objectScrapped.link = element.getAttribute("href")
      ? element.getAttribute("href")
      : constants_global.GLOBAL_NO_DATA;
    objectScrapped.levenshtein =
      objectScrapped.title === constants_global.GLOBAL_NO_DATA
        ? constants_global.GLOBAL_MAX_LEVEINSTEIN
        : levenshtein(objectScrapped.title, search);
    return objectScrapped;
  });
  objectsScrapped.sort(utils.compare_by_levenshtein);
  return objectsScrapped;
};
