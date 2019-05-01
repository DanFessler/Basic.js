function isEven(num)
    if num = 0
        return "true"
    else
        num: num - 1
        return isOdd(num)
    endif
endfunction

function isOdd(num)
    if num = 0
        return "false"
    else
        num: num - 1
        return isEven(num)
    endif
endfunction

testNum: 123
print testNum + " is even? " + isEven(testNum)
print testNum + " is odd? " + isOdd(testNum)
