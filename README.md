_This project is a work in progress and is not ready for production_

# Basic.js

a [BASIC](https://en.wikipedia.org/wiki/BASIC) interpreter written in JavaScript, using the [BASIN](https://github.com/DanFessler/basin) runtime.

Basic.js is a transitional language for beginners before learning JavaScript. It keeps the friendly syntax of BASIC, removing archaic ideas like line numbers and labels, while introducing JavaScript-like concepts such as functions and objects.

The core language is small and platform agnostic. As such, there are very few keywords to learn, instead, it relies on external JavaScript libraries for things such as i/o and graphics.

### To Do:

- [x] functions
- [x] Arrays
- [x] Bool literals
- [ ] library imports
- [ ] objects

## keywords

- While
- Wend
- For
- To
- Step
- Next
- If
- elseif
- else
- endif
- print

## Operators

- \+
- \-
- \*
- /
- :
- =
- <
- \>
- <>
- %
- and
- or

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
