
module.exports.pad = function(n, size) {
    var n = n.toString(),
        pad = '',
        size = size-n.length; 
    for (i=0; i < size; i++){ 
        pad += ' '; 
    }
    return n + pad; 
}

module.exports.flatten = function(arr, ret){
  var ret = ret || []
    , len = arr.length;
  for (var i = 0; i < len; ++i) {
    if (Array.isArray(arr[i])) {
      exports.flatten(arr[i], ret);
    } else {
      ret.push(arr[i]);
    }
  }
  return ret;
};