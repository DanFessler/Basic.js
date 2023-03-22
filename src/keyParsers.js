import Parser from "./parser.js";

export default {
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
        elseBody = this.keyParsers.IF.call(this);
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
