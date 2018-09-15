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

let opTable = {
  "+": "ADD",
  "-": "SUB",
  "*": "MUL",
  "/": "DIV"
};

let precedenceTable = {
  ASSIGNMENT: 1,
  CONDITIONAL: 2,
  SUM: 3,
  PRODUCT: 4,
  EXPONENT: 5,
  PREFIX: 6,
  POSTFIX: 7,
  CALL: 8
};

class Parser {
  constructor(tokens) {
    this.program = [];
    this.pos = 0;
    this.tokens = tokens;
  }

  parse() {
    let tokens = this.tokens;

    while (this.pos < tokens.length) {
      let token = tokens[this.pos];

      // check for keyword
      if (token.type == "KEY") {
        switch (token.lexeme.toUpperCase()) {
          case "PRINT":
            this.parsePrint();
            break;
          case "REPEAT":
            this.parseRepeat();
            break;
          default:
            console.error(`KEY NOT FOUND: "${token.lexeme}"`);
        }
      } else {
        this.program.push(this.parseExpression());
      }

      this.pos++;
    }
    this.pos = 0;

    console.log(JSON.stringify(this.program, 2, 2));
    return this.program;
  }

  parsePrint() {
    this.pos++;
    let line = {};
    let token = this.tokens[this.pos];
    if (token.type == "STR") {
      line = { PRINT: token.lexeme };
    } else {
      line = { PRINT: this.parseExpression() };
    }
    this.program.push(line);
  }

  parseRepeat() {
    this.pos++;
    let line = {};
    line = { REPEAT: this.parseExpression() };

    let endPos = this.pos++;
    while (this.tokens[endPos].lexeme.toLowerCase() !== "endrepeat") {
      // console.log(this.tokens[endPos].lexeme);
      endPos++;
    }
    let blockTokens = this.tokens.slice(this.pos, endPos);
    this.pos = endPos;
    line.script = new Parser(blockTokens).parse();
    this.program.push(line);
  }

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
