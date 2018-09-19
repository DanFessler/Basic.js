_This project is a work in progress and is not ready for production_

# Basic.js

a BASIC interpreter written JavaScript, using the [BASON](https://github.com/DanFessler/bason) runtime.

Basic.js is a transitional language for beginners before learning JavaScript. It keeps the friendly syntax of BASIC while introducing JavaScript-like concepts such as functions, and object literals.

The core language is small and platform agnostic. As such, there are very few keywords to learn, instead, it relies on external JavaScript libraries for things i/o and graphics.

### To Do:

* [ ] functions
* [ ] objects
* [ ] Arrays
* [ ] Bool literals
* [ ] library imports

## keywords

* While
* Wend
* For
* To
* Step
* Next
* If
* elseif
* else
* endif
* ~~function~~
* ~~endfunction~~
* ~~return~~
* print

## Operators

* \+
* \-
* \*
* /
* :
* =
* <
* \>
* <>
* %
* and, &
* or, |
* ( )

## Example

below is an example implementation of Fizz Buzz

```python
for i: 1 to 100
  if i % 15 = 0
    print "FizzBuzz"
  elseif i % 5 = 0
    print "Buzz"
  elseif i % 3 = 0
    print "Fizz"
  else
    print i
  endif
next
```

## Usage

Running a .BAS file via command line:
`node . [path-to/script.js]`

Running internal test script:
`npm run test`
