
module.exports.pad = (n, size) ->
    n = n.toString()
    pad = ''
    size = size - n.length;
    for i in [0 .. size]
        pad += ' '
    n + pad

module.exports.flatten = (arr, ret) ->
  ret ?= []
  len = arr.length
  for i in [0 .. len]
    if Array.isArray arr[i]
      exports.flatten arr[i], ret
    else
      ret.push arr[i]
  }
  ret