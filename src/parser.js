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
  // LET {IDN} {OPR:":"} <EXP>
  LET: function () {
    let token, key, value;
    token = this.consumeToken();
    if (token.type == "IDN") {
      key = token.lexeme;
    } else {
      this.error("expecting variable name", token);
      return;
    }
    token = this.consumeToken();
    if (!(token.type == "OPR" && token.lexeme == ":")) {
      this.error("expecting ':' operator", token);
      return;
    }
    this.consumeToken();
    value = this.parseExpression();

    return {
      LET: [key, value],
    };
  },

  // DIM {IDN} {GRP:"("} [{IDN} {SEP:","}] ({IDN}) {GRP:")"}
  DIM: function () {
    let token,
      name,
      params = [];

    name = this.consumeToken();
    if (name.type !== "IDN") this.error("DIM Expecting identifier", token);

    token = this.consumeToken();
    if (!(token.type == "GRP" && token.lexeme == "("))
      this.error("DIM Expecting '('", token);

    do {
      token = this.consumeToken();
      params.push(this.parseExpression());
      token = this.consumeToken();
    } while (token.type == "SEP");

    if (!(token.type == "GRP" && token.lexeme == ")"))
      this.error("DIM Expecting ')'", token);

    return { DIM: [name.lexeme, ...params] };
  },

  // PRINT <EXP>
  PRINT: function () {
    let token = this.consumeToken();
    let line = {
      PRINT: token.type == "STR" ? token.lexeme : this.parseExpression(),
    };
    return line;
  },

  // IF <EXP> <SCRIPT> ([ELSEIF <EXP> <SCRIPT>]) (ELSE <SCRIPT>) ENDIF
  IF: function () {
    let tok = this.consumeToken();
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
      this.error("expecting 'ENDIF'", tok);
      return;
    }
  },

  // SUSPENDUPDATE
  SUSPENDUPDATE: function () {
    return { SUSPENDUPDATE: null };
  },

  // RESUMEUPDATE
  RESUMEUPDATE: function () {
    return { RESUMEUPDATE: null };
  },

  // UPDATE
  UPDATE: function () {
    return { UPDATE: null };
  },

  // WHILE <EXP> <SCRIPT> WEND
  WHILE: function () {
    this.consumeToken();
    let line = { WHILE: null, script: [[this.parseExpression()]] };
    let blockTokens = this.findBlockContents("while", "wend", 1);
    if (blockTokens) {
      line.script.push(new Parser(blockTokens).parse());
      return line;
    } else {
      this.error("expected 'WEND'");
      return;
    }
  },

  // FOR {IDN} {OPR:":"} <EXP> TO <EXP> (STEP <EXP>) <SCRIPT> NEXT
  FOR: function () {
    let token,
      key,
      start,
      end,
      step = 1;
    token = this.consumeToken();
    if (token.type == "IDN") {
      key = token.lexeme;
    } else {
      this.error("expecting variable name");
      return;
    }
    token = this.consumeToken();
    if (!(token.type == "OPR" && token.lexeme == ":")) {
      this.error("expecting ':' operator");
      return;
    }
    this.consumeToken();
    start = this.parseExpression();
    token = this.consumeToken();
    if (!(token.type == "KEY" && token.lexeme.toUpperCase() == "TO")) {
      this.error("expecting 'TO' keyword");
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
        script: new Parser(blockTokens).parse(),
      };
      return line;
    } else {
      this.error(`expected 'NEXT'`);
      return;
    }
  },

  // FUNCTION {IDN} {GRP:"("} [{IDN} {SEP:","}] ({IDN}) {GRP:")"} <SCRIPT> ENDFUNCTION
  FUNCTION: function () {
    let token,
      name,
      params = [];

    name = this.consumeToken();
    if (name.type !== "IDN") return this.error("Expecting identifier");

    token = this.consumeToken();
    if (!(token.type == "GRP" && token.lexeme == "("))
      return this.error("Expecting '('");

    do {
      token = this.consumeToken();
      if (token.type == "IDN") {
        params.push(token.lexeme);
        token = this.consumeToken();
      } else if (!(token.type == "GRP" && token.lexeme == ")")) {
        return this.error("Expecting identifier");
      }
    } while (token.type == "SEP");

    if (!(token.type == "GRP" && token.lexeme == ")"))
      return this.error("Expecting ')'");

    let functionBody = this.findBlockContents("function", "endfunction", 1);

    if (functionBody) {
      return {
        FUNCTION: [name.lexeme, ...params],
        script: new Parser(functionBody).parse(),
      };
    } else {
      this.error(`expected 'ENDFUNCTION'`);
      return;
    }
  },

  // RETURN <EXP>
  RETURN: function () {
    let token = this.consumeToken();
    let line = {
      RETURN: this.parseExpression(),
    };
    return line;
  },

  // SLEEP <EXP>
  SLEEP: function () {
    let token = this.consumeToken();
    let line = {
      SLEEP: this.parseExpression(),
    };
    return line;
  },
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
          let node = { ...keywordParser.call(this), token };

          // if token is a function, hoist to the top
          if (token.lexeme.toUpperCase() == "FUNCTION") {
            this.program.unshift(node);
          } else {
            this.program.push(node);
          }
        } else {
          this.error(`Unrecognized keyword '${token.lexeme}'`, token);
        }
      } else {
        // Otherwise try to parse it as an expression
        this.program.push(this.parseExpression());
      }

      this.pos++;
    }

    return this.program;
  }

  error(e, token) {
    // console.log(token);
    throw { status: "Syntax Error", result: e, token };
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
        if (!suppressLog) this.error(`expected '${expectedToken.lexeme}'`);
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

  parseParams(endTok) {
    // when we begin parsing, we already looked ahead to match the opening parantheses, so advance
    this.pos = this.pos + 2;

    // return null if there were no params
    if (
      this.tokens[this.pos].type == "GRP" &&
      this.tokens[this.pos].lexeme == endTok
    ) {
      this.pos++;
      return null;
    }

    let params = [];

    while (
      this.tokens[this.pos + 1] &&
      !(
        this.tokens[this.pos + 1].type == "GRP" &&
        this.tokens[this.pos + 1].lexeme == endTok
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
    let index = null;
    let thisTok = this.tokens[this.pos];

    switch (thisTok.type) {
      case "IDN":
        let nextTok = this.tokens[this.pos + 1];

        expression = { [thisTok.lexeme]: null };
        if (!nextTok) break;
        if (nextTok.lexeme == "(") {
          expression = {
            [thisTok.lexeme]: this.parseParams(")"),
          };
          //break;
        }
        if (nextTok.lexeme == "[") {
          expression = {
            [thisTok.lexeme]: this.parseParams("]"),
          };
          nextTok = this.tokens[this.pos + 1];
        }
        if (nextTok && nextTok.lexeme == ":") {
          index = expression[Object.keys(expression)[0]];
          expression = Object.keys(expression)[0];
        }
        // expression.token = thisTok;
        break;
      case "NUM":
        expression = Number(thisTok.lexeme);
        break;
      case "BOOL":
        expression = thisTok.lexeme.toLowerCase() == "true";
        break;
      case "STR":
        expression = thisTok.lexeme;
        break;
      case "GRP":
        if (thisTok.lexeme == "(") {
          let group = this.findBlockContents("(", ")", 1);
          expression = new Parser(group).parse();
        } else {
          this.error(`Unexpected Token '${thisTok.lexeme}'`, thisTok);
        }
        break;
      default:
        return this.error("expecting expression", thisTok);
    }

    // Adding the token here for runtime error line/char reporting,
    // but since basin uses primitives for numbers, bools, and strings,
    // I can't attach a token to those.
    if (typeof expression === "object")
      expression.token = this.tokens[this.pos];

    while (
      this.tokens[this.pos + 1] &&
      this.tokens[this.pos + 1].type == "OPR"
    ) {
      let operator = this.tokens[this.pos + 1].lexeme.toLowerCase();

      let precedence = precedenceTable[operator];

      if (!lastPrecedence || precedence < lastPrecedence) {
        this.pos += 2;
        if (!index) index = [];
        expression = {
          [opTable[operator]]: [
            expression,
            ...index,
            this.parseExpression(precedence),
          ],
        };
      } else {
        return expression;
      }
    }
    return expression;
  }
}

module.exports = tokens => new Parser(tokens).parse();
