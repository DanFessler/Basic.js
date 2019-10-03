let size:10
let i:0
dim arr(size,size)

for y: 0 to size - 1
  for x: 0 to size - 1
    arr[x,y]: i
    i: i+1
  next
next

for y: 0 to size - 1
  for x: 0 to size - 1
    print ("This is index #" + arr[x,y])
  next
next
