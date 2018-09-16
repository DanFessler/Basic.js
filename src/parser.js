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
  "/": "DIV",
  ":": "SET"
};

let precedenceTable = {
  // ASSIGNMENT: 1,
  // CONDITIONAL: 2,
  // SUM: 3,
  // PRODUCT: 4,
  // EXPONENT: 5,
  // PREFIX: 6,
  // POSTFIX: 7,
  // CALL: 8
  ":": 0,
  "*": 1,
  "/": 1,
  "+": 2,
  "-": 2
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
          case "LET":
            this.parseLet();
          default:
            console.error(`KEY NOT FOUND: "${token.lexeme}"`);
        }
      } else {
        this.program.push(this.parseExpression());
      }

      this.pos++;
    }
    this.pos = 0;

    return this.program;
  }

  parseLet() {
    this.pos++;
    let name;
    let token = this.tokens[this.pos];
    if (token && token.type == "IDN") {
      name = token.lexeme;
      this.pos++;
    }
    let value = this.parseExpression();
    this.program.push({ LET: [name, value] });
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
    switch (this.tokens[this.pos].type) {
      case "IDN":
        if (
          this.tokens[this.pos + 1] &&
          this.tokens[this.pos + 1].lexeme == ":"
        )
          expression = this.tokens[this.pos].lexeme;
        else expression = { [this.tokens[this.pos].lexeme]: null };
        break;
      case "NUM":
        expression = Number(this.tokens[this.pos].lexeme);
        break;
      default:
        console.log("ERROR: expecting epxression");
    }
    while (
      this.tokens[this.pos + 1] &&
      this.tokens[this.pos + 1].type == "OPR"
    ) {
      let operator = this.tokens[this.pos + 1].lexeme;

      let precedence = precedenceTable[operator];

      if (!lastPrecedence || precedence < lastPrecedence) {
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
