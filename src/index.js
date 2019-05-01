const Lexer = require("./lexer.js");
const Parser = require("./parser.js");
let basin = require("basin-script");

module.exports = program => {
  program = Lexer(program);
  program = Parser(program);
  console.log(
    "Program AST:",
    "\n" + JSON.stringify(program, null, 1),
    "\n\nResult:"
  );
  basin.run(program);
};
