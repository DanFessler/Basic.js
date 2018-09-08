module.exports = class Lexer {
  constructor(rules) {
    this.line = 1;
    this.char = 1;
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
            thisTok.token += string[this.pos];
            this.pos++;
            this.char++;
          }
          if (this.ignore.indexOf(thisTok.type) === -1)
            this.tokens.push({ [thisTok.type]: thisTok.token });
          if (thisTok.type === "END") {
            this.line++;
            this.char = 1;
          }
          break; // prevent applying additional rules
        }
      }

      // if no rule matched, Error
      if (thisTok.type === null) {
        var rx = new RegExp(`(?:.*?\n){${this.line - 1}}(.+?)\n`, "s");
        let linePrefix = `${this.line} | `;
        console.error(
          "\x1b[31m%s\x1b[0m",
          `\nSyntaxError: Unexpected Token '${string[this.pos]}' on line ${
            this.line
          }:${this.char}`,
          "\n" +
            "\u001b[38;5;239m" +
            linePrefix +
            "\x1b[0m" +
            `${string.match(rx)[1]}\n`,
          " ".repeat(this.char - 2 + linePrefix.length) + "^\n"
        );
        break;
      }
    }
    return this.tokens;
  }
};
