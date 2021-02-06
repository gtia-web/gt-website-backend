function arrayIntersect(arr1, arr2) {
    for (i = 0; i < arr1.length; i++){
        for (j = 0; j < arr2.length; j++) {
            if (arr1[i] == arr2[j]) {
                return true;
            }
        }
    }
    return false;
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
}

module.exports = {
  arrayIntersect,
  asyncForEach
};