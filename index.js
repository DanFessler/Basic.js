const BASIC = require("./src");
const Lexer = require("./src/lexer2.js");

// Invalid matches:
// NUM: 12.
// STR: "poop
// this is because a match must be true for the duration of the token being built
// thus a string end quote must be optional or it will fail on the first character
// after the first quote.  Solution: add optional end condition

const newlex = new Lexer({
  rules: [
    { name: "END", pattern: /^(\r|\n)+$/ },
    { name: "COM", pattern: /^\/+.*$/ },
    { name: "SPC", pattern: /^\s+$/ },
    { name: "SEP", pattern: /^,$/ },
    { name: "LPR", pattern: /^\($/ },
    { name: "RPR", pattern: /^\)$/ },
    { name: "STR", pattern: /^\"(.*?)"?$/s, end: /^\".*"$/s, capture: 1 },
    { name: "NUM", pattern: /^[0-9]+\.?([0-9]+)?$/ },
    { name: "KEY", pattern: /^[a-zA-Z](\w+)?$/ },
    { name: "OPR", pattern: /^(:|\+|-|\*|%|=|<>|>|<|>=|<=|&|\|)$/ }
  ],
  ignore: ["COM", "SPC", "END"]
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
