function ArrayIntersect(arr1, arr2) {
    for (i = 0; i < arr1.length; i++){
        for (j = 0; j < arr2.length; j++) {
            if (arr1[i] == arr2[j]) {
                return true;
            }
        }
    }
    return false;
}


module.exports = {ArrayIntersect};