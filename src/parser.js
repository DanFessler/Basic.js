// statement:
//   keyword...
//
// expression:
//   IDN | literal | grouping | operation | function
//
// literal:
//   STR | NUM | "true" | "false"
//
// grouping:
//   GRP:"(" expression GRP:")"
//
// operation:
//   expression OPR expression

// Target result:
// [{ "ADD": [a, b] }, { "SUB": [a, b] }]

class Parser {
  constructor(rules) {
    this.grammar = [
      {
        print: "STR"
      }
    ];
  }

  parse(tokens) {
    let program = [];
    let pos = 0;
    while (pos < tokens.length) {
      let line = {};
      let token = {
        type: Object.keys(tokens[pos])[0],
        value: tokens[pos][Object.keys(tokens[pos])[0]]
      };
      for (let i = 0; i < this.grammar.length; i++) {
        if (
          Object.keys(this.grammar[i])[0].toLowerCase() ===
          token.value.toLowerCase()
        ) {
          line[token.value] = tokens[pos + 1].STR;
          program.push(line);
        }
      }
      pos++;
    }
    console.log(program);
    return program;
  }
}

module.exports = tokens => new Parser().parse(tokens);
