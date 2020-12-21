import * as fs from "fs";
import * as stream from "stream";

import { promiseGlob } from "./glob";
import { chainStreams } from "./streams";

/** Any void function that returns `stream.Transform`. */
export type Rule = () => stream.Transform;

/** Creates a stream line for transforming a file (without promising). */
const startTransformFile = (path: string, transformers: stream.Transform[]) => {
  const bufferPath = path + ".replacebuffer";

  const reader = fs.createReadStream(path);
  const writer = fs.createWriteStream(bufferPath);

  const closeStreams = chainStreams(reader, transformers, writer);

  const abortTransform = async () => {
    closeStreams();
    try {
      return fs.promises.unlink(bufferPath);
    } catch (e) {
      console.warn(e);
    }
  };

  const endTransform = () => {
    closeStreams();
    return fs.promises.rename(bufferPath, path);
  };

  return { stream: writer, abortTransform, endTransform };
};

/** `T | T[] => T[]` */
const normalizeArray = <T>(maybeArray: T[] | T): T[] =>
  Array.isArray(maybeArray) ? maybeArray : [maybeArray];

/** @param rules Any function(s) that return `stream.Transform`. */
export const transformFile = (
  rules: Rule[] | Rule
): ((path: string) => Promise<void>) => {
  const normalizedRules = normalizeArray(rules);
  const createTransformer = (rule: Rule) => rule();

  return async (path) => {
    const transformers = normalizedRules.map(createTransformer);
    const fileTransformation = startTransformFile(path, transformers);
    const { stream, abortTransform, endTransform } = fileTransformation;

    try {
      return new Promise<void>((resolve, reject) => {
        stream.on("finish", () => {
          endTransform().then(resolve);
        });
        stream.on("error", reject);
      });
    } catch (reason) {
      await abortTransform();
      return Promise.reject(reason);
    }
  };
};

/** @param rules Any function(s) that return `stream.Transform`. */
export const transformFiles = (rules: Rule[]) => (
  globPattern: string
): Promise<void> =>
  promiseGlob(globPattern)
    .then((paths) => Promise.all(paths.map(transformFile(rules))))
    .then(() => Promise.resolve());
