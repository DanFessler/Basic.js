const Lexer = require("./lexer.js");
const Parser = require("./parser.js");
let basin = require("../basin-script/src/interpreter.js");

module.exports = {
  run: (program, delay, debug) => {
    program = Lexer(program);

    if (debug)
      // Print out lexed tokens
      console.log("Program TOKENS:", "\n" + JSON.stringify(program, null, 1));

    program = Parser(
      // Filter out ignorable tokens before passing to the parser
      program.filter(token => {
        return !["COM", "SPC", "END"].includes(token.type);
      })
    );

    if (debug)
      // Print out generated Abstract Syntax Tree
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
