const { transformFiles } = require("../lib");
const replaceStream = require("replacestream");

transformFiles(() => replaceStream("BA", "AB"))("test/test-dir/**/*.txt");
