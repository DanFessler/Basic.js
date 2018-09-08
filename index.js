const BASIC = require("./src");
const Lexer = require("./src/lexer2.js");

const newlex = new Lexer({
  rules: {
    COM: /^\/+.*$/,
    SPC: /^\s+$/,
    END: /^(\r|\n)+$/,
    SEP: /^,$/,
    LPR: /^\($/,
    RPR: /^\)$/,
    STR: /^".*"?$/,
    NUM: /^[0-9]+\.?([0-9]+)?$/,
    KEY: /^[a-zA-Z](\w+)?$/,
    OPR: /^(=|\+|-|\*|%|==|<>|>|<|>=|<=|&|\|)$/
  },
  ignore: ["COM", "SPC"]
});

// Make sure we got a filename on the command line.
if (process.argv.length < 3) {
  console.log("Usage: node " + process.argv[1] + " FILENAME");
  process.exit(1);
}
// Read the file and print its contents.
let fs = require("fs");
let filename = process.argv[2];

fs.readFile(filename, "utf8", function(err, data) {
  if (err) throw err;
  // BASIC(data);

  // console.log(newlex.lex(data));
  newlex.lex(data).map(token => console.log(token));
});
