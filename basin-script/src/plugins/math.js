module.exports = {
  ADD: function(A, B) {
    return A + B;
  },
  SUB: function(A, B) {
    return A - B;
  },
  MUL: function(A, B) {
    return A * B;
  },
  DIV: function(A, B) {
    return A / B;
  },
  MOD: function(A, B) {
    return A % B;
  },

  // Pure functions (no need for implementation)
  ABS: function(val) {
    return Math.abs(val);
  },
  COS: function(val) {
    return Math.cos(val);
  },
  TAN: function(val) {
    return Math.tan(val);
  },
  ACOS: function(val) {
    return Math.acos(val);
  },
  ATAN: function(val) {
    return Math.atan(val);
  },
  DEGREES: function(rad) {
    return rad * 180 / Math.PI;
  },
  RADIANS: function(deg) {
    return deg * Math.PI / 180;
  },
  FLOOR: function(number) {
    return Math.floor(number);
  },
  CEIL: function(number) {
    return Math.ceil(number);
  },
  POW: function(number, p) {
    return Math.pow(number, p);
  },
  SQR: function(number) {
    return Math.pow(number, 2);
  }
};
