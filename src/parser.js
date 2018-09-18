// TODO:
// generalize token consumption code
// Handle parselet error reporting
// Add block content search
// better case-sensitive handling
// complete opTable and precedenceTable
// add parenthesis parsing to expressions

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

let keywordParsers = {
  PRINT: function() {
    let token = this.consumeToken();
    let line = {
      PRINT: token.type == "STR" ? token.lexeme : this.parseExpression()
    };
    this.program.push(line);
  },

  IF: function() {
    this.consumeToken();
    let line = { IF: this.parseExpression() };
    let token = this.consumeToken();
    if (token.type == "KEY" && token.lexeme.toLowerCase() == "then") {
      let ifBody = this.findBlockContents("if", ["else", "endif"], 1);
      // let ifBody = this.findBlockContents("if", "endif", 1);
      if (ifBody !== null) {
        let elseBody;
        if (this.tokens[this.pos].lexeme.toLowerCase() == "else") {
          elseBody = this.findBlockContents("if", "endif", 1);
        }
        line.script = [
          new Parser(ifBody).parse(),
          elseBody ? new Parser(elseBody).parse() : null
        ];
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
};

class Parser {
  constructor(tokens) {
    this.program = [];
    this.pos = 0;
    this.tokens = tokens;
    this.keywords = keywordParsers;
  }

  parse() {
    let tokens = this.tokens;

    while (this.pos < tokens.length) {
      let token = tokens[this.pos];

      // If it starts with a keyword, find its parser
      let keywordParser = this.keywords[token.lexeme.toUpperCase()];
      if (token.type == "KEY" && keywordParser) {
        keywordParser.call(this);
      } else {
        // Otherwise try to parse it as an expression
        this.program.push(this.parseExpression());
      }

      this.pos++;
    }

    return this.program;
  }

  consumeToken() {
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
    let lastEndLexeme = null;
    while (count !== 0 && this.tokens[this.pos + 1]) {
      let token = this.consumeToken();
      if (token.type == "KEY") {
        if (token.lexeme.toLowerCase() == startLexeme.toLowerCase()) {
          let lastEndLexeme = null;
          count++;
        }
        if (Array.isArray(endLexeme)) {
          for (let i = 0; i < endLexeme.length; i++) {
            if (token.lexeme.toLowerCase() == endLexeme[i].toLowerCase()) {
              if (lastEndLexeme == null || i <= lastEndLexeme) {
                lastEndLexeme = i;
                count--;
              }
            }
          }
        } else {
          if (token.lexeme.toLowerCase() == endLexeme.toLowerCase()) count--;
        }
      }
    }
    return count == 0 ? this.tokens.slice(initialpos, this.pos) : null;
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
