import keywordParsers from "./keyParsers.js";

const opTable = {
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
  or: "OR",
};

const precedenceTable = {
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
  ":": 7,
};

class Parser {
  constructor(tokens) {
    this.program = [];
    this.pos = 0;
    this.tokens = tokens;
  }

  error(e, token) {
    // console.log(token);
    throw { status: "Syntax Error", result: e, token };
  }

  isCurrentToken(expectedToken) {
    let token = this.currentToken();
    return (
      token.type == expectedToken.type && token.lexeme == expectedToken.lexeme
    );
  }

  consumeToken(expectedToken, suppressErr) {
    this.pos++;
    let token = this.currentToken();

    if (!expectedToken || this.isCurrentToken(expectedToken)) return token;
    if (suppressErr) return null;

    // otherwise throw error
    this.error(`expected '${expectedToken.lexeme}'`);
  }

  currentToken() {
    return this.tokens[this.pos];
  }

  nextToken() {
    return this.tokens[this.pos + 1];
  }

  parse() {
    let tokens = this.tokens;

    while (this.pos < tokens.length) {
      let token = tokens[this.pos];
      let { type, lexeme } = token;
      lexeme = lexeme.toUpperCase();

      // if the token is recognized as a keyword, use it's keyword parser
      if (type == "KEY") {
        if (lexeme in keywordParsers) {
          let parser = keywordParsers[lexeme];

          // create the AST node, and append the token itself for error reporting
          let node = { ...parser.call(this), token };

          // if token is a function, hoist to the top
          if (lexeme.toUpperCase() == "FUNCTION") {
            this.program.unshift(node);
          }
          // otherwise push to the bottom
          else {
            this.program.push(node);
          }
        }
        // If we got here, we've declared it as a key, but didn't provide a definition
        // but also could be valid keywords that don't need a definition like "to"
        else {
          throw {
            status: "Internal Error",
            result: `Unrecognized keyword '${lexeme}'\nToken was likely declared as a keyword, but has no function definition`,
            token,
          };
        }
      }

      // Otherwise try to parse it as an expression
      else {
        let node = this.parseExpression();
        this.program.push(node);
      }

      this.pos++;
    }

    return this.program;
  }

  parseParams(endTok) {
    // when we begin parsing, we already looked ahead to match the opening parantheses, so advance
    this.pos = this.pos + 2;

    // return null if there were no params
    if (
      this.currentToken().type == "GRP" &&
      this.currentToken().lexeme == endTok
    ) {
      this.pos++;
      return null;
    }

    let params = [];

    while (
      this.nextToken() &&
      !(this.nextToken().type == "GRP" && this.nextToken().lexeme == endTok)
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

  parseIdentifier(token) {
    let expression, index;
    let nextTok = this.nextToken();

    expression = { [token.lexeme]: null };

    if (nextTok) {
      // function params
      if (nextTok.lexeme == "(") {
        expression = {
          [token.lexeme]: this.parseParams(")"),
        };
        nextTok = this.nextToken();
      }

      // array index
      else if (nextTok.lexeme == "[") {
        expression = {
          [token.lexeme]: this.parseParams("]"),
        };
        nextTok = this.nextToken();
      }

      // assignment
      if (nextTok && nextTok.lexeme == ":") {
        index = expression[token.lexeme];
        expression = token.lexeme;
      }
    }

    return [expression, index];
  }

  parseParens(token) {
    if (token.lexeme != "(") {
      this.error(`Unexpected Token '${token.lexeme}'`, token);
    }

    let group = this.findBlockContents("(", ")", 1);
    return new Parser(group).parse();
  }

  parseValue() {
    let expression, index;
    let token = this.currentToken();

    switch (token.type) {
      case "IDN":
        [expression, index] = this.parseIdentifier(token);
        break;
      case "GRP":
        expression = this.parseParens(token);
        break;
      case "NUM":
        expression = Number(token.lexeme);
        break;
      case "BOOL":
        expression = token.lexeme.toLowerCase() == "true";
        break;
      case "STR":
        expression = token.lexeme;
        break;
      default:
        return this.error("expecting expression", token);
    }

    // Adding the token here for runtime error line/char reporting,
    // but since basin uses primitives for numbers, bools, and strings,
    // I can't attach a token to those.
    if (typeof expression === "object") expression.token = token;

    return [expression, index];
  }

  parseExpression(lastPrecedence = Infinity) {
    let [expression, index] = this.parseValue();

    // Expressions continue to chain so long as the next token is an operator
    // Precedence determines if expressions should parse recursively vs flat
    while (this.nextToken() && this.nextToken().type == "OPR") {
      let operator = this.nextToken().lexeme.toLowerCase();
      let operatorKey = opTable[operator];
      let precedence = precedenceTable[operator];

      if (precedence >= lastPrecedence) return expression;

      this.pos += 2;
      if (!index) index = [];
      expression = {
        [operatorKey]: [expression, ...index, this.parseExpression(precedence)],
      };
    }
    return expression;
  }

  findBlockContents(startLexeme, endLexeme, initialCount) {
    let count = initialCount ? initialCount : 0;
    let initialpos = this.pos + 1;

    // TODO: if the start of the block wasn't consumed yet,
    // we should loop through the code until we find one

    // Keep looping until we find our closing key or we run out of tokens
    let lastEndLexeme = null;
    while (count !== 0 && this.nextToken()) {
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
}

export default Parser;
