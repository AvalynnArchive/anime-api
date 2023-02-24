import * as gogoanime from "./src/gogoanime/search";
import * as utils from "./util/util";

interface SearchOptions {
  [key: string]: any;
}

export default {
  links: async (search: string, options: SearchOptions = {}) => {
    const directories = utils.get_website_from_directory("./src/");
    const search_paths = utils.get_search_path_for_directories(directories);
    const promises = search_paths.map((search_path) => {
      const website = require(search_path);
      return website.search(search, options);
    });
    let rsl = await Promise.all(promises);
    rsl = rsl.flat();
    rsl.sort(utils.compare_by_levenshtein);
    rsl = utils.apply_options(rsl, options);
    return rsl;
  },
  stream: async (
    search: string,
    episode: number,
    options: SearchOptions = {}
  ) => {
    const promises: Promise<any>[] = [];
    const stream_gogoanime = gogoanime.stream(search, episode, options);
    promises.push(stream_gogoanime);
    let rsl = await Promise.all(promises);
    // Removing the empty result
    rsl = rsl.filter((link) => link);
    return rsl;
  },
};
