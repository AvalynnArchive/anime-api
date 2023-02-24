import * as utils from "../../util/util";
import * as libs from "../../util/global_search";
import * as constants_global from "../../util/constants_global";
import * as constants from "../../util/anime_constants";

interface SearchOptions {
  limit_per_website?: number;
}

interface ScrapLinkOptions {
  BRACKET: boolean;
}

interface ScrapStreamOptions {
  source: string;
  link: string;
}

interface StreamOptions {
  website?: string[];
}

interface SearchResult {
  link: string;
}

interface StreamResult {
  source: string;
  link: string;
}

export = {
  search: async (
    search: string,
    options: SearchOptions
  ): Promise<SearchResult[]> => {
    return libs.search(
      constants_global.WEBSITE.GOGOANIME,
      constants.URL_SEARCH,
      search,
      options,
      module.exports.scrap_link
    );
  },
  scrap_link: (doc: Document, search: string): SearchResult[] => {
    return libs.scrap_link(
      constants_global.WEBSITE.GOGOANIME,
      ".main_body .last_episodes ul li .name a",
      { BRACKET: true },
      doc,
      search
    );
  },
  scrap_stream: (doc: Document, episode: string): StreamResult => {
    const elements = [...doc.querySelectorAll("#episodes li a")];
    const object_stream = elements.find(
      (element) => element.innerHTML.trim() === "EP " + episode
    );
    const object_scrapped: StreamResult = {
      source: constants.NAME,
      link: constants.URL_BASE + object_stream.getAttribute("href"),
    };
    return object_scrapped;
  },
  stream: async (
    search: string,
    episode: number,
    options: StreamOptions
  ): Promise<StreamResult[]> => {
    if (
      options.website &&
      !options.website.includes(constants_global.WEBSITE.ANIMELAND)
    ) {
      return [];
    }

    const search_best_one = await module.exports.search(search, {
      limit_per_website: 1,
    });
    const source = await utils.url_to_cloudflare_source(
      constants.URL_BASE + search_best_one[0].link,
      "#episodes li a"
    );
    if (source !== null) {
      const doc = utils.source_to_dom(source);
      const object_stream = module.exports.scrap_stream(doc, episode);
      return [object_stream];
    }

    return [];
  },
};
