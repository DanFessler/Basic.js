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
      // for (let token in this.rules) {
      for (let i = 0; i < this.rules.length; i++) {
        let token = this.rules[i];

        // If the first character matched a rule, keep
        // adding characters until it no longer matches
        // and add it to the token stack
        if (token.pattern.test(string[this.pos])) {
          thisTok.type = token.name;
          let loop = true;
          while (loop) {
            thisTok.token += string[this.pos];
            this.pos++;
            this.char++;

            // Update line:char tracking for error reporting
            if (string[this.pos] == "\n") {
              this.line++;
              this.char = 1;
            }

            if (
              !token.pattern.test(thisTok.token + string[this.pos]) ||
              this.pos >= string.length
            ) {
              loop = false;
            } else if (
              token.end &&
              token.end.test(thisTok.token) &&
              thisTok.token.length > 1
            ) {
              loop = false;
            }
          }

          if (this.ignore.indexOf(thisTok.type) === -1) {
            // if the rule has a capture group, use it to generate final token
            let processedToken = token.capture
              ? thisTok.token.match(token.pattern)[token.capture]
              : thisTok.token;

            this.tokens.push({ [thisTok.type]: processedToken });
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
          }:${this.char - 1}`,
          "\n" +
            "\u001b[38;5;239m" +
            linePrefix +
            "\x1b[0m" +
            `${string.match(rx)[1]}\n`,
          " ".repeat(this.char - 3 + linePrefix.length) + "^\n"
        );
        break;
      }
    }
    return this.tokens;
  }
};
