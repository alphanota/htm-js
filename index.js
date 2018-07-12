
var vectorious = require('vectorious'),
    Matrix = vectorious.Matrix,
    Vector = vectorious.Vector,
    BLAS = vectorious.BLAS; // access BLAS routines


// norm_vec <- function(x) sqrt(sum(x^2))
// v1 = c(2,0,0)
// v2 = c(2,-1,0)
//
// y = c(1,3,2)
//
// y = t(t)
//
// X = rbind(v1,v2)
// X=t(X)
// XtX = t(X) %*% X
// XtXinv = solve(XtX)
// H = X %*% XtXinv %*% t(X)
// yhat = H %*% y
// norm_vec(yhat-y)


function sum(a, b) {
  return a + b;
}

const distToPlane2 = (v1, v2, p) => {
    let X = Matrix.augment(v1.transpose(),v2.transpose())
    let Xt = X.transpose()
    let XtX = Xt.multiply(X)
    let XtXinv = XtX.inverse()


    console.log(X)
    console.log(XtXinv)

    let H = X.multiply(XtXinv)
    H = H.multiply(Xt)
    let yh = H.multiply(p.transpose())
    let diff = Matrix.subtract(yh,p.transpose()) //typo in 'subtract'
    let sqrd = Matrix.product(diff,diff)
    return sqrd.reduce(sum)
}


const d1 =new Matrix([[34,0,0]])
const d2 = new Matrix([[0,29,0]])

const point = new Matrix([[0,2,1]])


console.log(distToPlane2(d1,d2,point))
