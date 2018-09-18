i: 0
repeat 10
  print i
  i: i+1
endrepeat

i:10

if i<11 then
  print "i is less than 11"
  if i<5 then
    print "i is less than 5"
  endif
endif

if i<10 then
  print "i is less than 10"
else
  print "i is not less than 10"
endif
