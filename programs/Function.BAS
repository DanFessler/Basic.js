function isEven(num)
    if num = 0
        return "true"
    else
        return isOdd(num - 1)
    endif
endfunction

function isOdd(num)
    if num = 0
        return "false"
    else
        return isEven(num - 1)
    endif
endfunction

testNum: 123
print testNum + " is even? " + isEven(testNum)
print testNum + " is odd? " + isOdd(testNum)
