# jsbasic

a BASIC interpreter written JavaScript, and uses the [BASON](danfessler/bason) runtime

This project is a work in progress and is not ready for production

# keywords

* [x] While
* [x] Wend
* [x] For
* [x] To
* [x] Step
* [x] Next
* [x] If
* [ ] elseif
* [x] else
* [x] endif
* [ ] function
* [ ] endfunction
* [ ] return
* [x] print

# Operators

* [x] "+" Add
* [x] "-" Subtract
* [x] "\*" Multiply
* [x] "/" Divide
* [x] ":" Assign
* [x] "=" Equality
* [x] "<" Less Than
* [x] ">" Greater Than
* [x] "<>" Not Equal
* [x] "%" Modulo
* [x] "&" And
* [x] "|" Or
* [x] "( )" groupings

# Example

below is an example implementation of Fizz Buzz

```python
for i: 1 to 100
  if i % 15 = 0
    print "FizzBuzz"
  else
    if i % 5 = 0
      print "Buzz"
    else
      if i % 3 = 0
        print "Fizz"
      else
        print i
      endif
    endif
  endif
next
```

# Usage

Running a .BAS file via command line:
`node . [path-to/script.js]`

Running internal test script:
`npm run test`
