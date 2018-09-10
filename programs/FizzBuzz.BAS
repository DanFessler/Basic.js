for i: 1 to 100
  if (i%15) = 0 then
    print "FizzBuzz"
  elseif (i%5) = 0 then
    print "Buzz"
  elseif (i % 3) = 0 then
    print "Fizz"
  else
    print i
  endif
next
