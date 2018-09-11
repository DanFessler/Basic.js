const Lexer = require("./lexer.js");
const Parser = require("./parser.js");
let bason = require("bason");

// Extending Bason's core language
bason.Stack = [
  ...bason.Stack,
  ...[
    {
      TEST: function() {
        console.log("poop");
      }
    }
  ]
];

module.exports = program => {
  program = Lexer(program);
  program = Parser(program);
  // console.log(program);
  bason.RUN(program);
};
