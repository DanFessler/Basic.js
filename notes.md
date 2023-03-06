# exposed core functions:
discovered that any imported plugin function is exposed to BASIC even core functions of BASIN like 'while', 'if', etc.  This means that even math operators can also be computed with their function directly `ADD(a,b)`. It assumes that all params are BASIC expressions and will fail if they are not recognized as such. Should probably prevent any of this from happening

some additional thinking, this only manifests when the function name doesn't match with a defined keyword.  When a keyword is defined with the same name, the direct access to the function is prevented.

# Line/char tracking: (done)
line char tracking is only partially supported and only shows with an unexpected token. Should expand this feature to all errors including syntax and runtime.

Went ahead and added broader support. I'm sure it will need more work in the future.

# leaky javascript objects:
it's possible to get computed values like NULL, NaN, and Undefined passed to BASIC, which has no concept of them

# Array access
discovered I can get the value of an array with both () as well as [], but only can set with []. Not desirable.

Also when attempting to access out of range index with a number primitive, line:char isn't being reported