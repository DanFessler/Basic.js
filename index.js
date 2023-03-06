const BASIC = require("./src");
BASIC.import(require("./plugins/testPlugin"));

// Make sure we got a filename on the command line.
if (process.argv.length < 3) {
  console.log("Usage: node " + process.argv[1] + " FILENAME");
  process.exit(1);
}
// Read the file and print its contents.
let fs = require("fs");
let filename = process.argv[2];

fs.readFile(filename, "utf8", function(err, data) {
  if (err) throw err;
  try {
    BASIC.run(data, null, false);
  } catch (e) {
    // internal error
    if (!e.status) {
      console.error("\x1b[35m" + `(INTERNAL) ${e}` + "\x1b[0m");
    }

    // program error
    else {
      let { status, result, token } = e;

      if (token) {
        // console.log("TOKEN", token);
        let rx = new RegExp(`(?:.*?\n){${token.line - 1}}(.+?)(?:\n|$)`, "s");
        let line = data.match(rx)[1];
        let linePrefix = `${token.line} | `;

        console.error(
          "\n\x1b[31m" +
            `${status}!\n` +
            `${result} on line ${token.line}:${token.char}\n\n` +
            `${linePrefix}${line}\n` +
            " ".repeat(token.char - 1 + linePrefix.length) +
            "^" +
            "\x1b[0m"
        );
      } else {
        console.error("\x1b[31m" + `${status}: ${result}` + "\x1b[0m");
      }
    }
  }
});
