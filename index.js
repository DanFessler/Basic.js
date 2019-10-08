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
  BASIC.run(data, null, false);
});
