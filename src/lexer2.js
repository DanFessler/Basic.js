module.exports = class Lexer {
  constructor(rules) {
    this.pos = 0;
    this.tokens = [];
    this.rules = rules.rules;
    this.ignore = rules.ignore;
  }

  lex(string) {
    while (this.pos < string.length) {
      let thisTok = { type: null, token: "" };

      // Loop through rules to find type match
      for (let token in this.rules) {
        // If the first character matched a rule, keep
        // adding characters until it no longer matches
        // and add it to the token stack
        if (this.rules[token].test(string[this.pos])) {
          thisTok.type = token;
          while (this.rules[token].test(thisTok.token + string[this.pos])) {
            thisTok.token += string[this.pos++];
          }
          if (this.ignore.indexOf(thisTok.type))
            this.tokens.push({ [thisTok.type]: thisTok.token });
          break; // prevent applying additional rules
        }
      }

      // if no rule matched, match any single character
      if (thisTok.type === null) {
        console.error(
          "\x1b[31m%s\x1b[0m",
          "ERROR: No matching rule found for " + string[this.pos]
        );
        this.tokens.push({ NUL: string[this.pos++] });
        // break;
      }
    }
    return this.tokens;
  }
};
