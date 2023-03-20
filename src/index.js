const Lexer = require("./lexer.js");
const Parser = require("./parser.js");
let basin = require("basin-script");



module.exports = {
  basin,
  run: async (program, delay, debug) => {
    let tokens;
    try {
      tokens = Lexer(program);
    } catch (e) {
      throw e;
    }

    // Print out lexed tokens
    if (debug) {
      console.log("Program TOKENS:", "\n" + JSON.stringify(tokens, null, 1));
    }

    let ast;
    try {
      ast = Parser(
        // Filter out ignorable tokens before passing to the parser
        tokens.filter((token) => {
          return !["COM", "SPC"].includes(token.type);
        })
      );
    } catch (e) {
      throw e;
    }

    // Print out generated Abstract Syntax Tree
    if (debug) {
      console.log(
        "Program AST:",
        "\n" + JSON.stringify(ast, null, 1),
        "\n\nResult:"
      );
    }

    try {
      await basin.start(ast, delay);
    } catch (e) {
      throw e;
    }
  },
  stop: () => {
    basin.stop();
  },
  import: (plugin) => {
    basin.import(plugin);
  },
};
