const Tokenize = require("./lexer.js");
const Parser = require("./parser.js");

module.exports = program => {
  program = Parser(Tokenize(program));
  console.log(program);
  // program.forEach(function(line) {
  //   if (keywords[line.command.key])
  //     keywords[line.command.key](line.params[0].str);
  //   else console.log("Runtime error: " + line.command.token + " not defined");
  // });
};

keywords = {
  PRINT: function(string) {
    console.log(string);
  },
  ADD: function() {}
};
