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
// [{ "ADD": [{ "MUL": [5, 2] }, b] }]

// 5 + 2 * 3
// print (5 + (2 * 3)) = 11
// NOT   ((5 + 2) * 3) = 21

let result = [{ ADD: [5, { MUL: [2, 3] }] }];

// token: "print",
// is type "key"?
// YES
// check rule for "print": expression
// loop through tokens until rule not satisfied

let opTable = {
  "+": "ADD",
  "-": "SUB",
  "*": "MUL",
  "/": "DIV"
};

class Parser {
  constructor(tokens) {
    this.program = [];
    this.pos = 0;
    this.tokens = tokens;
    this.grammar = [
      {
        print: "STR"
      }
    ];
  }

  parse() {
    let tokens = this.tokens;

    while (this.pos < tokens.length) {
      let line = {};
      let token = tokens[this.pos];

      // check for keyword
      if (this.isKeyword(token)) {
        line[token.lexeme] = tokens[this.pos + 1].lexeme;
        this.program.push(line);
      } else {
        this.program.push(this.parseExpression());
      }

      this.pos++;
    }
    this.pos = 0;
    console.log(JSON.stringify(this.program, 2, 2));
    return this.program;
  }

  isKeyword(token) {
    for (let i = 0; i < this.grammar.length; i++) {
      if (
        Object.keys(this.grammar[i])[0].toLowerCase() ===
        token.lexeme.toLowerCase()
      ) {
        return true;
      }
    }
  }

  isLiteral(token) {}

  parseExpression(lastPrecedence) {
    let expression = Number(this.tokens[this.pos].lexeme);
    while (
      this.tokens[this.pos + 1] &&
      this.tokens[this.pos + 1].type == "OPR"
    ) {
      let operator = this.tokens[this.pos + 1].lexeme;

      let precedence;
      if ((operator == "+") | (operator == "-")) precedence = 1;
      if ((operator == "*") | (operator == "/")) precedence = 2;

      if (!lastPrecedence || precedence > lastPrecedence) {
        this.pos += 2;
        expression = {
          [opTable[operator]]: [expression, this.parseExpression(precedence)]
        };
      } else {
        return expression;
      }
    }
    return expression;
  }
}

module.exports = tokens => new Parser(tokens).parse();
