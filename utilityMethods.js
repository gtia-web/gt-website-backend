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

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/user/login')
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
  }

module.exports = {
  ArrayIntersect, 
  checkNotAuthenticated, 
  checkAuthenticated
};