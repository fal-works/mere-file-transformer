import * as stream from "stream";

/**
 * Applies `pipe()` and chains all streams.
 * @returns A function that closes all streams.
 */
export const chainStreams = (
  reader: stream.Readable,
  transformers: stream.Transform[],
  writer: stream.Writable
): (() => void) => {
  let stream: stream.Transform = reader.pipe(transformers[0]);
  for (let i = 1; i < transformers.length; i += 1)
    stream = stream.pipe(transformers[i]);
  stream.pipe(writer);

  const closeStreams = () => {
    reader.destroy();
    for (const stream of transformers) stream.destroy();
    writer.destroy();
  };

  return closeStreams;
};
