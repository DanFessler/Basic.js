let opTable = {
  "+": "ADD",
  "-": "SUB",
  "*": "MUL",
  "/": "DIV",
  ":": "SET",
  "=": "==",
  "<": "<",
  ">": ">",
  "<>": "<>",
  "%": "MOD",
  and: "AND",
  or: "OR"
};

let precedenceTable = {
  "*": 1,
  "/": 1,
  "%": 1,
  "+": 2,
  "-": 2,
  "<": 3,
  ">": 3,
  "=": 4,
  "<>": 4,
  and: 5,
  or: 6,
  ":": 7
};

let keywordParsers = {
  PRINT: function() {
    let token = this.consumeToken();
    let line = {
      PRINT: token.type == "STR" ? token.lexeme : this.parseExpression()
    };
    return line;
  },

  IF: function() {
    this.consumeToken();
    let line = { IF: this.parseExpression() };
    let ifBody = this.findBlockContents("if", ["elseif", "else", "endif"], 1);

    if (ifBody !== null) {
      let elseBody;

      // recursively call if parser for each elseif statement
      // which gets nested in each if's elsebody
      if (this.tokens[this.pos].lexeme.toLowerCase() == "elseif") {
        elseBody = this.keywords.IF.call(this);
      }

      if (this.tokens[this.pos].lexeme.toLowerCase() == "else") {
        elseBody = new Parser(this.findBlockContents("if", "endif", 1)).parse();
      }

      line.script = [new Parser(ifBody).parse(), elseBody ? elseBody : null];
      return line;
    } else {
      console.error(`ERROR: expecting 'ENDIF'`);
      return;
    }
  },

  SUSPENDUPDATE: function() {
    return { SUSPENDUPDATE: null };
  },

  RESUMEUPDATE: function() {
    return { RESUMEUPDATE: null };
  },

  UPDATE: function*() {
    return { UPDATE: null };
  },

  WHILE: function() {
    this.consumeToken();
    let line = { WHILE: null, script: [[this.parseExpression()]] };
    let blockTokens = this.findBlockContents("while", "wend", 1);
    if (blockTokens) {
      line.script.push(new Parser(blockTokens).parse());
      return line;
    } else {
      console.error(`ERROR: expected 'WEND'`);
      return;
    }
  },

  FOR: function() {
    let token,
      key,
      start,
      end,
      step = 1;
    token = this.consumeToken();
    if (token.type == "IDN") {
      key = token.lexeme;
    } else {
      console.error("ERROR: expecting variable name");
      return;
    }
    token = this.consumeToken();
    if (!(token.type == "OPR" && token.lexeme == ":")) {
      console.error("ERROR: expecting ':' operator");
      return;
    }
    this.consumeToken();
    start = this.parseExpression();
    token = this.consumeToken();
    if (!(token.type == "KEY" && token.lexeme.toUpperCase() == "TO")) {
      console.error("ERROR: expecting 'TO' keyword");
      return;
    }
    this.consumeToken();
    end = this.parseExpression();

    token = this.tokens[this.pos + 1];
    if (token.type == "KEY" && token.lexeme.toUpperCase() == "STEP") {
      this.consumeToken();
      this.consumeToken();
      step = this.parseExpression();
    }

    let blockTokens = this.findBlockContents("for", "next", 1);
    if (blockTokens) {
      let line = {
        FOR: [key, start, end, step],
        script: new Parser(blockTokens).parse()
      };
      return line;
    } else {
      console.error(`ERROR: expected 'NEXT'`);
      return;
    }
  },

  FUNCTION: function() {
    let token,
      name,
      params = [];

    name = this.consumeToken();
    if (name.type !== "IDN") return console.log("ERROR: Expecting identifier");

    token = this.consumeToken();
    if (!(token.type == "GRP" && token.lexeme == "("))
      return console.log("ERROR: Expecting '('");

    do {
      token = this.consumeToken();
      if (token.type == "IDN") {
        params.push(token.lexeme);
        token = this.consumeToken();
      } else if (!(token.type == "GRP" && token.lexeme == ")")) {
        return console.log("ERROR: Expecting identifier");
      }
    } while (token.type == "SEP");

    if (!(token.type == "GRP" && token.lexeme == ")"))
      return console.log("ERROR: Expecting ')'");

    let functionBody = this.findBlockContents("function", "endfunction", 1);

    if (functionBody) {
      return {
        FUNCTION: [name.lexeme, ...params],
        script: new Parser(functionBody).parse()
      };
    } else {
      console.error(`ERROR: expected 'ENDFUNCTION'`);
      return;
    }
  },

  RETURN: function() {
    let token = this.consumeToken();
    let line = {
      RETURN: this.parseExpression()
    };
    return line;
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
      if (token.type == "KEY") {
        if (keywordParser) {
          if (token.lexeme.toUpperCase() == "FUNCTION") {
            this.program.unshift(keywordParser.call(this));
          } else this.program.push(keywordParser.call(this));
        } else {
          console.log(`ERROR: Unrecognized keyword '${token.lexeme}'`);
        }
      } else {
        // Otherwise try to parse it as an expression
        this.program.push(this.parseExpression());
      }

      this.pos++;
    }

    return this.program;
  }

  consumeToken(expectedToken, suppressLog) {
    this.pos++;
    let token = this.tokens[this.pos];
    if (expectedToken !== undefined) {
      if (
        token.type == expectedToken.type &&
        token.lexeme == expectedToken.lexeme
      ) {
        return token;
      } else {
        if (!suppressLog)
          console.error(`ERROR: expected '${expectedToken.lexeme}'`);
        return null;
      }
    } else return token;
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
      // if (token.type == "KEY") {
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
      // }
    }
    return count == 0 ? this.tokens.slice(initialpos, this.pos) : null;
  }

  parseParams() {
    // when we begin parsing, we already looked ahead to match the opening parantheses, so advance
    this.pos = this.pos + 2;

    // return null if there were no params
    if (
      this.tokens[this.pos].type == "GRP" &&
      this.tokens[this.pos].lexeme == ")"
    ) {
      this.pos++;
      return null;
    }

    let params = [];

    while (
      this.tokens[this.pos + 1] &&
      !(
        this.tokens[this.pos + 1].type == "GRP" &&
        this.tokens[this.pos + 1].lexeme == ")"
      )
    ) {
      params.push(this.parseExpression());
      if (this.consumeToken({ type: "SEP", lexeme: "," }, true) === null) {
        return params;
      }
      this.pos++;
    }
    // we ran into the end of the params, so lets manually parse the last one
    params.push(this.parseExpression());

    this.pos++;
    return params;
  }

  parseExpression(lastPrecedence) {
    let expression;
    switch (this.tokens[this.pos].type) {
      case "IDN":
        let nextTok = this.tokens[this.pos + 1];
        if (nextTok && (nextTok.lexeme == ":" || nextTok.lexeme == "(")) {
          if (this.tokens[this.pos + 1].lexeme == ":") {
            expression = this.tokens[this.pos].lexeme;
          }
          if (this.tokens[this.pos + 1].lexeme == "(") {
            expression = { [this.tokens[this.pos].lexeme]: this.parseParams() };
          }
        } else expression = { [this.tokens[this.pos].lexeme]: null };
        break;
      case "NUM":
        expression = Number(this.tokens[this.pos].lexeme);
        break;
      case "STR":
        expression = this.tokens[this.pos].lexeme;
        break;
      case "GRP":
        if (this.tokens[this.pos].lexeme == "(") {
          let group = this.findBlockContents("(", ")", 1);
          expression = new Parser(group).parse();
        } else {
          console.log("ERROR: expecting '('");
        }
        break;
      default:
        return console.log("ERROR: expecting expression");
    }
    while (
      this.tokens[this.pos + 1] &&
      this.tokens[this.pos + 1].type == "OPR"
    ) {
      let operator = this.tokens[this.pos + 1].lexeme.toLowerCase();

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
