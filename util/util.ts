import * as errors from "../src/Err/errors";
import got from "got";
import jsdom, { VirtualConsole } from "jsdom";
import puppeteer from "puppeteer";
import fs from "fs";

const { JSDOM } = jsdom;
const virtualConsole = new VirtualConsole();

export const get_website_from_directory = (path: string): string[] => {
  const everything = fs.readdirSync(path, { withFileTypes: true });
  const directories = everything.filter((files) => files.isDirectory());
  const directories_name = directories.map((directory) => directory.name);
  const directories_name_filtered = directories_name.filter(
    (directory_name) => directory_name !== "global"
  );
  return directories_name_filtered;
};

export const get_search_path_for_directory = (
  directory_name: string
): string => {
  return `./${directory_name}/search`;
};

export const get_search_path_for_directories = (
  directories_name: string[]
): string[] => {
  return directories_name.map(get_search_path_for_directory);
};

export const url_to_source = async (safe_url: any): Promise<any | null> => {
  try {
    const response = await got(safe_url);
    return response.body;
  } catch {
    return errors.handle_error(errors.ERROR_WRONG_STATUS_CODE, {
      url: safe_url,
    });
  }
};

export const url_to_cloudflare_source = async (
  url: string,
  waitForElement: string
): Promise<string | null> => {
  const safe_url = url.toLowerCase();
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  try {
    await page.setUserAgent(
      "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36"
    );
    await page.goto(safe_url);
    await page.waitForSelector(waitForElement, {
      visible: true,
      timeout: 30000,
    });
    const response = await page.content();
    await page.close();
    await browser.close();
    return response;
  } catch {
    errors.handle_error(errors.ERROR_WRONG_STATUS_CODE, { url: safe_url });
    page.close();
    browser.close();
    return null;
  }
};

export const source_to_dom = (source: string): Document => {
  const dom = new JSDOM(source, { virtualConsole });
  return dom.window.document;
};

export const search = async (
  anime_search_link: string,
  search: string,
  dom = true,
  space: any = null
): Promise<Document | string | null> => {
  if (search === "") {
    errors.handle_error(errors.ERROR_SEARCH_EMPTY);
    return null;
  }

  let search_encoded = search.trim().toLowerCase();
  if (space) {
    search_encoded = search_encoded.replace(/\s/g, space);
  }

  search_encoded = encodeURI(search_encoded);
  const source = await url_to_source(anime_search_link + search_encoded);
  return dom ? source_to_dom(source) : source;
};

export const clean_title = (
  title: string,
  clean_option: { BRACKET: boolean; EM: boolean }
): string => {
  if (clean_option.BRACKET) {
    title = title.replace(/\([^)]*\)/gi, "");
  }

  if (clean_option.EM) {
    title = title.replace(/<em>/gi, "");
    title = title.replace(/<\/em>/gi, "");
  }

  title = title.trim();
  return title;
};

export const apply_options = (
  objects: any[],
  options: { limit_per_website?: number; limit?: number }
): any[] => {
  if (options.limit_per_website) {
    objects = objects.slice(0, options.limit_per_website);
  }

  if (options.limit) {
    objects = objects.slice(0, options.limit);
  }

  return objects;
};

export const compare_by_levenshtein = (
  a: { levenshtein: number },
  b: { levenshtein: number }
): number => {
  if (a.levenshtein > b.levenshtein) {
    return 1;
  }

  if (b.levenshtein > a.levenshtein) {
    return -1;
  }

  return 0;
};
