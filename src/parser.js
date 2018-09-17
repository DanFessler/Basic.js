// TODO:
// generalize token consumption code
// Handle parselet error reporting
// Add block content search
// better case-sensitive handling
// complete opTable and precedenceTable

let opTable = {
  "+": "ADD",
  "-": "SUB",
  "*": "MUL",
  "/": "DIV",
  ":": "SET",
  "=": "==",
  "<": "<",
  ">": ">"
};

let precedenceTable = {
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
            break;
          case "IF":
            this.parseIf();
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

    return this.program;
  }

  consume() {
    this.pos++;
    let token = this.tokens[this.pos];
    return token;
  }

  findBlockContents(startLexeme, endLexeme, initialCount) {
    let count = initialCount ? initialCount : 0;
    let initialpos = this.pos + 1;

    // TODO: if the start of the block wasn't consumed yet,
    // we should loop through the code until we find one

    // Keep looping until we find our closing key or we run out of tokens
    while (count !== 0 && this.tokens[this.pos]) {
      let token = this.consume();
      if (token.type == "KEY") {
        if (token.lexeme.toLowerCase() == startLexeme.toLowerCase()) count++;
        if (token.lexeme.toLowerCase() == endLexeme.toLowerCase()) count--;
      }
    }
    // console.log(this.tokens.slice(initialpos, this.pos), this.tokens[this.pos]);
    return count == 0 ? this.tokens.slice(initialpos, this.pos) : null;
  }

  // If var = 1 then
  //   print "hello world"
  // elseif var = 2 then
  //   print "hello poop"
  // else
  //   print "go away"
  // endif
  parseIf() {
    this.consume();
    let line = { IF: this.parseExpression() };
    let token = this.consume();
    if (token.type == "KEY" && token.lexeme.toLowerCase() == "then") {
      let ifBody = this.findBlockContents("if", "endif", 1);
      if (ifBody !== null) {
        line.script = new Parser(ifBody).parse();
        this.program.push(line);
      } else {
        console.error(`ERROR: expecting 'ENDIF'`);
        return;
      }
    } else {
      console.error(`ERROR: expected 'THEN', found '${token.lexeme}'`);
      return;
    }
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
    let line = { REPEAT: this.parseExpression() };
    let blockTokens = this.findBlockContents("repeat", "endrepeat", 1);

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
