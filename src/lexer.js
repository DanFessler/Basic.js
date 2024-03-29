const config = {
  rules: [
    { name: "END", pattern: /^(\r|\n)+$/ },
    { name: "COM", pattern: /^\'+.*$/ },
    { name: "SPC", pattern: /^\s+$/ },
    { name: "SEP", pattern: /^,$/ },
    { name: "GRP", pattern: /^(\(|\))$/ },
    { name: "ARR", pattern: /^(\[|\])$/ },
    {
      name: "STR",
      pattern: /^\"([\s\S]*?)"?$/,
      end: /^\"[\s\S]*"$/,
      capture: 1
    },
    { name: "NUM", pattern: /^[0-9]+\.?([0-9]+)?$/ },
    { name: "IDN", pattern: /^[a-zA-Z](\w+)?$/i },
    { name: "OPR", pattern: /^(:|\+|-|\*|\/|%|=|<>|>|<|>=|<=)$/ }
  ],

  keywords: [
    "while",
    "wend",
    "for",
    "to",
    "step",
    "next",
    "if",
    "elseif",
    "else",
    "endif",
    "print",
    "function",
    "endfunction",
    "return",
    "suspendupdate",
    "resumeupdate",
    "update",
    "sleep",
    "let",
    "dim"
  ],

  operators: ["and", "or"],

  bools: ["true", "false"]
};

class Lexer {
  constructor(rules) {
    this.line = 1;
    this.char = 1;
    this.pos = 0;
    this.tokens = [];
    this.rules = rules.rules;
    this.keywords = rules.keywords;
    this.operators = rules.operators;
    this.bools = rules.bools;
  }

  tokenize(string) {
    while (this.pos < string.length) {
      let thisTok = {
        type: null,
        lexeme: "",
        line: this.line,
        char: this.char,
      };

      // Loop through rules to find type match
      for (let i = 0; i < this.rules.length; i++) {
        let token = this.rules[i];

        // If the first character matched a rule, keep
        // adding characters until it no longer matches
        // and add it to the token stack
        if (token.pattern.test(string[this.pos])) {
          thisTok.type = token.name;

          let loop = true;
          while (loop) {
            thisTok.lexeme += string[this.pos];

            // Update line:char tracking
            if (string[this.pos] == "\n") {
              this.line++;
              this.char = 0;
            }
            this.pos++;
            this.char++;

            // if we failed to match or reached the end of the content,
            // then we're done with this token
            if (
              !token.pattern.test(thisTok.lexeme + string[this.pos]) ||
              this.pos >= string.length
            ) {
              loop = false;
            } else if (
              token.end &&
              token.end.test(thisTok.lexeme) &&
              thisTok.lexeme.length > 1
            ) {
              // if token rule has an end condition, check it as well
              loop = false;
            }
          }

          // Now lets push finished token to the stack...

          // if token is a reserved keyword, change the type
          for (let key in this.keywords) {
            if (
              thisTok.lexeme.toLowerCase() === this.keywords[key].toLowerCase()
            )
              thisTok.type = "KEY";
          }

          // if token is a reserved operator, change the type
          for (let op in this.operators) {
            if (
              thisTok.lexeme.toLowerCase() === this.operators[op].toLowerCase()
            )
              thisTok.type = "OPR";
          }

          // if token is a reserved bool, change the type
          for (let key in this.bools) {
            if (thisTok.lexeme.toLowerCase() === this.bools[key].toLowerCase())
              thisTok.type = "BOOL";
          }

          // if the rule has a capture group, use it to generate final token
          thisTok.lexeme = token.capture
            ? thisTok.lexeme.match(token.pattern)[token.capture]
            : thisTok.lexeme;

          this.tokens.push(thisTok);
          break; // prevent applying additional rules
        }
      }

      // if no rule matched, Error
      if (thisTok.type === null) {
        throw {
          status: "Syntax Error",
          result: `Unexpected Token '${string[this.pos]}'`,
          token: thisTok,
        };
        break;
      }
    }

    return this.tokens;
  }
}

module.exports = data => new Lexer(config).tokenize(data);
