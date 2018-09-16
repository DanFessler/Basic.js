const Lexer = require("./lexer.js");
const Parser = require("./parser.js");
let bason = require("./bason");

module.exports = program => {
  program = Lexer(program);
  program = Parser(program);
  console.log(JSON.stringify(program, null, 1));
  bason.RUN(program);
};
