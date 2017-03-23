function filterOrderByObject() {
  return function(items, field, reverse) {
    var filtered = items.slice();

    filtered.sort(function (a, b) {

      return (getDescendantProp(a, field) > getDescendantProp(b, field) ? 1 : -1);
    });
    if(reverse) filtered.reverse();
    return filtered;
  };
};


function getDescendantProp(obj, desc) {
    var arr = desc.split(".");
    while(arr.length && (obj = obj[arr.shift()]));
    return obj;
}
