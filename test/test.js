const { transformFiles } = require("../lib");
const replaceStream = require("replacestream");

transformFiles(() => replaceStream("AB", "BA"))("test/test-dir/**/*.txt");
