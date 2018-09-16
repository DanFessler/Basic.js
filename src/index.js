const Lexer = require("./lexer.js");
const Parser = require("./parser.js");
let bason = require("./bason");

module.exports = program => {
  program = Lexer(program);
  program = Parser(program);
  bason.RUN(program);
};
