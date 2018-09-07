// REGEX notes:
// Identifier: [a-zA-Z](\w+)?
// Label: [a-zA-Z](\w+)?:

module.exports = data => {
  let tokens = [];

  data.split(/\r\n/).forEach(function(statement) {
    let token = "";
    let type = null;

    console.log(statement);

    for (let i = 0; i < statement.length; i++) {
      token += statement[i];

      // Determine what token type we're defining
      if (type == null) type = identify(token);

      switch (type) {
        case "ws":
          if (!RegExp(/(\s|\r\r)+/).test(statement[i])) {
            token = push(token, 1);
          }
          break;
        case "str":
          if (statement[i] == '"' && token.length > 1) {
            token = push(token.substring(1, token.length - 1), 0);
          }
          break;
        case "num":
          if (!RegExp(/[0-9]/).test(statement[i])) {
            token = push(token, 1);
          }
          break;
        case "opr":
          if (!RegExp(/\+|\-|\*|\/|\=|\(|\)|\,0/).test(statement[i])) {
            token = push(token, 1);
          }
          break;
        case "key":
          if (!RegExp(/[a-zA-Z0-9]/).test(statement[i])) {
            token = push(token, 1);
          }
          break;
      }

      if (i == statement.length - 1 && type !== null) {
        token = push(token, 0);
      }

      function push(tok, trim, dontPush) {
        let oldTok = tok.substr(0, tok.length - trim);
        let newTok = tok.substr(tok.length - trim, tok.length);
        let tokObj = {};
        tokObj[type] = oldTok;
        if (type !== "ws") tokens.push(tokObj);

        type = identify(newTok);
        return newTok;
      }

      function identify(token) {
        if (!token) return null;
        else if (RegExp(/\s|\r/).test(token[0])) return "ws";
        else if (token[0] == `"`) return "str";
        else if (RegExp(/[0-9]/).test(token[0])) return "num";
        else if (RegExp(/\+|\-|\*|\/|\=|\(|\)|\,/).test(token[0])) return "opr";
        else return "key";
      }
    }

    tokens.push({ end: null });
  });

  return tokens;
};
