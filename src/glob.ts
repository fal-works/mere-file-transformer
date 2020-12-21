import { IOptions, glob } from "glob";

/** Creates a callback for `glob()`. */
const createCallback = (
  resolve: (matches: string[]) => void,
  reject: (reason?: any) => void
) => (err: Error | null, matches: string[]): void => {
  if (err) reject(err);
  resolve(matches);
};

/** Promisified `glob()`. */
export const promiseGlob = (
  globPattern: string,
  options?: IOptions
): Promise<string[]> =>
  new Promise((resolve: (matches: string[]) => void, reject) => {
    const callback = createCallback(resolve, reject);
    return options
      ? glob(globPattern, options, callback)
      : glob(globPattern, callback);
  });
