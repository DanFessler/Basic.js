const Lexer = require("./lexer.js");
const Parser = require("./parser.js");
let basin = require("basin-script");

module.exports = {
  run: (program, debug) => {
    program = Lexer(program);
    program = Parser(program);
    if (debug)
      console.log(
        "Program AST:",
        "\n" + JSON.stringify(program, null, 1),
        "\n\nResult:"
      );
    basin.run(program);
  },
  import: plugin => {
    basin.import(plugin);
  }
};
