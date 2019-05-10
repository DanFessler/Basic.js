module.exports = {
  LET: function(key, value) {
    var obj = {};
    obj[key] = value;
    this.Stack.push(obj);
  },
  SET: function(key, value) {
    var variable = this.find(key);

    // if no variable was found in the stack, define one
    if (variable == null) {
      this.Stack.push({ [key]: value });
      variable = this.find(key);
    }

    variable[key] = value;
  },
  FUNCTION: function(key) {
    var args = Array.prototype.slice.call(arguments);
    var params = args.slice(1, args.length - 1);
    var script = args[args.length - 1];

    var obj = {};
    obj[key] = function*() {
      try {
        yield* this.evaluate(
          script,
          function(key, value) {
            for (let i = 0; i < key.length; i++) {
              this.find("LET")["LET"].bind(this)(key[i], value[i]);
            }
          }.bind(this, params, [...arguments])
        );
      } catch (value) {
        return value;
      }
    };

    this.Stack.push(obj);
  },
  RETURN: function(value) {
    throw value;
  },
  FOR: function*(key, start, end, step, script) {
    let startTime = Date.now();
    let variable = { [key]: start };
    this.Stack.push(variable);
    for (null; variable[key] <= end; variable[key] += step ? step : 1) {
      yield* this.evaluate(script);

      // ensure we never get caught in an infinite loop
      yield* this.update(this.shouldUpdate);
    }
  },
  WHILE: function*(condition, script) {
    let startTime = Date.now();
    while (yield* this.evaluate(script[0][0])) {
      yield* this.evaluate(script[1]);

      // ensure we never get caught in an infinite loop
      yield* this.update(this.shouldUpdate);
    }
  },
  SLEEP: function*(time) {
    let startTime = Date.now();
    while ((Date.now() - startTime) / 1000 < time) {
      // ensure we never get caught in an infinite loop
      yield* this.update(true);
    }
  },
  IF: function*(condition, script) {
    if (condition) {
      yield* this.evaluate(script[0]);
    } else {
      if (script[1]) yield* this.evaluate(script[1]);
    }
  },
  PRINT: function() {
    var string = "";
    for (var i = 0; i < arguments.length; i++) {
      string += arguments[i] != null ? arguments[i] : "";
    }
    console.log(string);
  },
  SUSPENDUPDATE: function() {
    this.shouldUpdate = false;
  },
  RESUMEUPDATE: function*() {
    this.shouldUpdate = true;
    yield* this.update(true);
  },
  UPDATE: function*() {
    yield* this.update(true);
  }
};
