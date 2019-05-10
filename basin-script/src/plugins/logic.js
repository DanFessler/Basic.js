module.exports = {
  "==": function(A, B) {
    return A == B;
  },
  "<>": function(A, B) {
    return A != B;
  },
  ">": function(A, B) {
    return A > B;
  },
  "<": function(A, B) {
    return A < B;
  },
  ">=": function(A, B) {
    return A >= B;
  },
  "<=": function(A, B) {
    return A <= B;
  },
  AND: function(A, B) {
    return A && B;
  },
  OR: function(A, B) {
    return A || B;
  }
};
