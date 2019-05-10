module.exports = {
  "==": function(A, B) {
    console.log(A, B, A == B);
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
