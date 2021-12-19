import path from "path";
import fs from "fs";
import matter from "gray-matter";
import { Post } from "../model/post.model";

interface ReadPostsConfig {
  directory: string;
}

const getFullPathTo = (...pathSegment: string[]) => {
  const paths = [process.cwd(), ...pathSegment];
  return path.join(...paths);
};

const defaultPostsDirectory = getFullPathTo("blogs", "content", "posts");

const extractPostMeta = (data: { [k: string]: any }) => {
  const extract = (propName: string, errorMsg: string) => {
    if (data[propName] != null) {
      return data[propName];
    } else {
      throw new Error(errorMsg);
    }
  };

  const title = extract("title", "Post must have a title");
  const dateStr = extract("date", "Post must have a date");
  const published = extract("published", "Post must have a 'published' flag");

  return {
    title,
    dateStr,
    published,
  };
};

const validatePostMeta = (data: { [k: string]: any }): Post["meta"] => {
  const coerceBoolean = (s: any): boolean => {
    if (typeof s === "boolean") return s;

    if (!s || typeof s !== "string") {
      throw new Error(`Cannot coerce '${s}' to a boolean.`);
    }

    const _s = s.trim();

    if (_s === "true" || _s === "True") return true;
    if (_s === "false" || _s === "False") return false;

    throw new Error(`Cannot coerce '${s}' to a boolean.`);
  };

  const coerceDateString = (s: string): Date => {
    return new Date(Date.parse(s));
  };

  return {
    title: data.title,
    date: coerceDateString(data.dateStr),
    published: coerceBoolean(data.published),
  };
};

const getPostMeta = (data: { [k: string]: any }): Post["meta"] => {
  return validatePostMeta(extractPostMeta(data));
};

const getSlug = (mdFilename: string) => mdFilename.replace(/\.md$/, "");

const getPost = (directory: string, fileName: string): Promise<Post> => {
  return new Promise((resolve, reject) => {
    const fullFilePath = path.join(directory, fileName);

    fs.readFile(fullFilePath, "utf8", (err, fileData) => {
      if (err) {
        reject(`file at location '${fullFilePath}' does not exist`);
      }

      const { data, content } = matter(fileData);
      const slug = getSlug(fileName);

      try {
        const meta = getPostMeta(data);
        resolve({ slug, content, meta });
      } catch (e) {
        reject(e);
      }
    });
  });
};

export const readPosts = (
  config: Partial<ReadPostsConfig> = {}
): Promise<Post[]> => {
  const { directory = defaultPostsDirectory } = config;

  return new Promise((resolve, reject) => {
    fs.readdir(directory, (err, postFileNames) => {
      if (err) {
        reject(`posts directory does not exist: ${directory}`);
      }
      resolve(
        Promise.all(postFileNames.map((name) => getPost(directory, name)))
      );
    });
  });
};
