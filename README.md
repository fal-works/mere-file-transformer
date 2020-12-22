# mere-file-transformer

Tiny library for transforming multiple files asynchronously.

- Returns `Promise`.
- Uses Node.js `stream` API.
- `stream.Transform` needs to be prepared (consider using [replacestream](https://www.npmjs.com/package/replacestream)).


## API

```ts
const transformFile: (rules: Rule[] | Rule) => (path: string) => Promise<void>;
const transformFiles: (rules: Rule[] | Rule) => (globPattern: string) => Promise<void>;
```

Here `Rule` is any function that returns `stream.Transform`.
