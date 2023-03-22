// const Lexer = require("./lexer.js");
// const Parser = require("./parser.js");
// let basin = require("basin-script");

import Lexer from "./lexer.js";
import Parser from "./parser.js";
import basin from "basin-script";

export default {
  run: (program, delay, debug) => {
    let tokens;
    try {
      tokens = Lexer(program);
    } catch (e) {
      throw e;
    }

    // Print out lexed tokens
    if (debug) {
      console.log("Program TOKENS:", "\n" + JSON.stringify(program, null, 1));
    }

    let ast;
    try {
      ast = new Parser(
        // Filter out ignorable tokens before passing to the parser
        tokens.filter((token) => {
          return !["COM", "SPC", "END"].includes(token.type);
        })
      ).parse();
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

    basin.start(ast, delay);
  },
  stop: () => {
    basin.stop();
  },
  import: (plugin) => {
    basin.import(plugin);
  },
};
