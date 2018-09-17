const Lexer = require("./lexer.js");
const Parser = require("./parser.js");

// referencing external repo for now, should use NPM package
let bason = require("../../bason");

module.exports = program => {
  program = Lexer(program);
  program = Parser(program);
  console.log(
    "Program AST:",
    "\n" + JSON.stringify(program, null, 1),
    "\n\nResult:"
  );
  bason.RUN(program);
};
