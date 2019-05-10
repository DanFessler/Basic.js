const Lexer = require("./lexer.js");
const Parser = require("./parser.js");
let basin = require("../basin-script/src/interpreter.js");

module.exports = {
  run: (program, delay, debug) => {
    program = Lexer(program);
    if (debug)
      console.log("Program TOKENS:", "\n" + JSON.stringify(program, null, 1));
    program = Parser(program);
    if (debug)
      console.log(
        "Program AST:",
        "\n" + JSON.stringify(program, null, 1),
        "\n\nResult:"
      );
    basin.start(program, delay);
  },
  stop: () => {
    basin.stop();
  },
  import: plugin => {
    basin.import(plugin);
  }
};
