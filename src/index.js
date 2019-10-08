const Lexer = require("./lexer.js");
const Parser = require("./parser.js");
let basin = require("basin-script");

module.exports = {
  run: (program, delay, debug) => {
    try {
      program = Lexer(program);
    } catch (e) {
      return;
    }

    // Print out lexed tokens
    if (debug) {
      console.log("Program TOKENS:", "\n" + JSON.stringify(program, null, 1));
    }

    try {
      program = Parser(
        // Filter out ignorable tokens before passing to the parser
        program.filter(token => {
          return !["COM", "SPC", "END"].includes(token.type);
        })
      );
    } catch (e) {
      return;
    }

    // Print out generated Abstract Syntax Tree
    if (debug) {
      console.log(
        "Program AST:",
        "\n" + JSON.stringify(program, null, 1),
        "\n\nResult:"
      );
    }

    basin.start(program, delay);
  },
  stop: () => {
    basin.stop();
  },
  import: plugin => {
    basin.import(plugin);
  }
};
