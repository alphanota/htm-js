import Base from "./Base";
const gEpsilon = 1.0e-15;
const Pr = 3.1415926535897932385 / 180.0;
const HTMNAMEMAX = 32;
const iS2 = 0;
const iN1 = 1;
const iS1 = 2;
const iN2 = 3;
const iS3 = 4;
const iN0 = 5;
const iS0 = 6;
const iN3 = 7;

const n0 = [1, 0, 4]; //N0
const n1 = [4, 0, 3]; //N1
const n2 = [3, 0, 2]; //N2
const n3 = [2, 0, 1]; //N3

const s0 = [1, 5, 2]; //S0
const s1 = [2, 5, 3]; //S1
const s2 = [3, 5, 4]; //S2
const s3 = [4, 5, 1]; //S3

const N_indexes = [n0, n1, n2, n3];
const S_indexes = [s0, s1, s2, s3];

// original 6 points of icos
const a0 = [0, 0, 1]; // 0
const a1 = [1, 0, 0]; // 1
const a2 = [0, 1, 0]; // 2
const a3 = [-1, 0, 0]; // 3
const a4 = [0, -1, 0]; // 4
const a5 = [0, 0, -1]; // 5

const anchor = [a0, a1, a2, a3, a4, a5];

const bases = [
  new Base("S2", 10, 3, 5, 4),
  new Base("N1", 13, 4, 0, 3),
  new Base("S1", 9, 2, 5, 3),
  new Base("N2", 14, 3, 0, 2),
  new Base("S3", 11, 4, 5, 1),
  new Base("N0", 12, 1, 0, 4),
  new Base("S0", 8, 1, 5, 2),
  new Base("N3", 15, 2, 0, 1)
];

var vectorious = require("vectorious"),
  Matrix = vectorious.Matrix,
  Vector = vectorious.Vector,
  BLAS = vectorious.BLAS; // access BLAS routines

function sum(a, b) {
  return a + b;
}

const norm_vec = v => {
  let csqrd = Matrix.product(v, v).reduce(sum); // c^2 = a^2 + b^2
  return Math.sqrt(csqrd);
};

const unit_vector = v => {
  let _mag = norm_vec(v);
  return v.scale(1 / _mag);
};
//calculate midpoint for two vectors v1 v2, and store in vec w
const m4_midpoint = (v1, v2, w) => {
  let v1m = new Matrix([v1]);
  let v2m = new Matrix([v2]);
  let w_prime = unit_vector(v1m.add(v2m)).toArray()[0];
  w[0] = w_prime[0];
  w[1] = w_prime[1];
  w[2] = w_prime[2];
};

const distToPlane2 = (v1, v2, p) => {
  let X = Matrix.augment(v1.transpose(), v2.transpose());
  let Xt = X.transpose();
  let XtX = Xt.multiply(X);
  let XtXinv = XtX.inverse();
  let H = X.multiply(XtXinv);
  H = H.multiply(Xt);
  let yh = H.multiply(p.transpose());
  let diff = Matrix.subtract(yh, p.transpose()); //typo in 'subtract'
  let sqrd = Matrix.product(diff, diff);
  return sqrd.reduce(sum);
};

const isinside = (p, v1, v2, v3) => {
  let crossp = [0, 0, 0];

  crossp[0] = v1[1] * v2[2] - v2[1] * v1[2];
  crossp[1] = v1[2] * v2[0] - v2[2] * v1[0];
  crossp[2] = v1[0] * v2[1] - v2[0] * v1[1];
  if (p[0] * crossp[0] + p[1] * crossp[1] + p[2] * crossp[2] < -gEpsilon)
    return false;

  crossp[0] = v2[1] * v3[2] - v3[1] * v2[2];
  crossp[1] = v2[2] * v3[0] - v3[2] * v2[0];
  crossp[2] = v2[0] * v3[1] - v3[0] * v2[1];
  if (p[0] * crossp[0] + p[1] * crossp[1] + p[2] * crossp[2] < -gEpsilon)
    return false;

  crossp[0] = v3[1] * v1[2] - v1[1] * v3[2];
  crossp[1] = v3[2] * v1[0] - v1[2] * v3[0];
  crossp[2] = v3[0] * v1[1] - v1[0] * v3[1];
  if (p[0] * crossp[0] + p[1] * crossp[1] + p[2] * crossp[2] < -gEpsilon)
    return false;

  return true;
};

const startpane = (v1, v2, v3, xin, yin, zin, name) => {
  let tvec = 0.0;
  let baseID = 0;
  let baseindex = 0;
  if (xin > 0 && yin >= 0) {
    baseindex = zin >= 0 ? iN3 : iS0;
  } else if (xin <= 0 && yin > 0) {
    baseindex = zin >= 0 ? iN2 : iS1;
  } else if (xin < 0 && yin <= 0) {
    baseindex = zin >= 0 ? iN1 : iS2;
  } else if (xin >= 0 && yin < 0) {
    baseindex = zin >= 0 ? iN0 : iS3;
  } else {
    console.log("Error");
  }

  baseID = bases[baseindex].ID;

  tvec = anchor[bases[baseindex].v1];
  v1[0] = tvec[0];
  v1[1] = tvec[1];
  v1[2] = tvec[2];

  tvec = anchor[bases[baseindex].v2];
  v2[0] = tvec[0];
  v2[1] = tvec[1];
  v2[2] = tvec[2];

  tvec = anchor[bases[baseindex].v3];
  v3[0] = tvec[0];
  v3[1] = tvec[1];
  v3[2] = tvec[2];

  name = name + bases[baseindex].name; // TODO is this memory efficient?
  return { baseID, name };
};

const copy_vec = (v, w) => {
  v[0] = w[0];
  v[1] = w[1];
  v[2] = w[2];
};

/* for a given vector x,y,z return the HTM ID to the given depth*/
const lookup = (x, y, z, depth) => {
  let rstat = 0;
  let startID = 0;

  let v1 = [0, 0, 0];
  let v2 = [0, 0, 0];
  let v0 = [0, 0, 0];
  let w1 = [0, 0, 0];
  let w2 = [0, 0, 0];
  let w0 = [0, 0, 0];
  let p = [0, 0, 0];
  let dtmp = 0;

  p[0] = x;
  p[1] = y;
  p[2] = z;

  // Get the ID of the level0 triangle, and its starting vertices

  /**
   * where to start in the HTM quadtree when looking for a vectors home
   * xin yin zin are thin input vector
   * v1 v2 v3 and name are loaded with the initial tringle points
   * and the name of the triangle
   */

  let { name, baseid } = startpane(v0, v1, v2, x, y, z, "");

  startID = baseid;

  // Start searching for the children
  //*/
  while (depth-- > 0) {
    m4_midpoint(v0, v1, w2);
    m4_midpoint(v1, v2, w0);
    m4_midpoint(v2, v0, w1);
    if (isinside(p, v0, w2, w1)) {
      name += "0";
      copy_vec(v1, w2);
      copy_vec(v2, w1);
    } else if (isinside(p, v1, w0, w2)) {
      name += "1";
      copy_vec(v0, v1);
      copy_vec(v1, w0);
      copy_vec(v2, w2);
    } else if (isinside(p, v2, w1, w0)) {
      name += "2";
      copy_vec(v0, v2);
      copy_vec(v1, w1);
      copy_vec(v2, w0);
    } else if (isinside(p, w0, w1, w2)) {
      name += "3";
      copy_vec(v0, w0);
      copy_vec(v1, w1);
      copy_vec(v2, w2);
    } else {
      Console.log("PANIC");
    }
  }
  return name;
};

const nameToId = name => {
  let out = 0;
  let i = 0;
  const CHARCODE_3 = 51;
  const CHARCODE_0 = 48;

  if (name == null || name.length == 0)
    // null pointer-name
    Console.log("PANIC INVALIDNAME");
  if (name[0] != "N" && name[0] != "S")
    // invalid name
    Console.log("PANIC INVALIDNAME");
  let siz = name.length; // determine string length
  // at least size-2 required, don't exceed max
  if (siz < 2) Console.log("PANIC INVALIDNAME");
  if (siz > HTMNAMEMAX) Console.log("PANIC INVALIDNAME");
  for (i = siz - 1; i > 0; i--) {
    // set bits starting from the end
    if (name.charCodeAt(i) > CHARCODE_3 || name.charCodeAt(i) < CHARCODE_0) {
      // invalid name
      Console.log("PANIC INVALIDNAME");
    }
    // javascript currently does not support bitwise operatations
    // on integers greater than 32 bits,
    // Original code:
    // out += (name.charCodeAt(i) - CHARCODE_0) << (2 * (siz - i - 1));

    // use Math.pow() to calculate bitwise shift instead, problem,
    // more expensive? TODO Find a better workaround, library
    let shift = 2 * (siz - i - 1);
    let diff = name.charCodeAt(i) - CHARCODE_0;
    out += diff * Math.pow(2, shift);
  }

  i = 2; // set first pair of bits, first bit always set
  if (name[0] == "N") {
    i++;
  } // for north set second bit too
  let last = i * Math.pow(2, 2 * siz - 2);
  out += last;
  return out;
};

const lookupId = (x, y, z, depth) => {
  let name = lookup(x, y, z, depth);
  let rstat = nameToId(name);
  return rstat;
};

const lookupIdRaDec = (ra, dec, depth) => {
  let x, y, z;
  let cd = Math.cos(dec * Pr);
  x = Math.cos(ra * Pr) * cd;
  y = Math.sin(ra * Pr) * cd;
  z = Math.sin(dec * Pr);
  return lookupId(x, y, z, depth);
};

const lookupNameRaDec = (ra, dec, depth) => {
  let x, y, z;
  let cd = Math.cos(dec * Pr);
  x = Math.cos(ra * Pr) * cd;
  y = Math.sin(ra * Pr) * cd;
  z = Math.sin(dec * Pr);
  return lookup(x, y, z, depth);
};

class HTMmap {
  constructor() {}

  nameToId(name) {
    return nameToId(name);
  }

  lookupId(x, y, z, depth) {
    return lookupId(x, y, z, depth);
  }

  lookupIdRaDec(ra, dec, depth) {
    return lookupIdRaDec(ra, dec, depth);
  }

  lookupIdLonLat(lon, lat, depth) {
    return lookupIdRaDec(lon, lat, depth);
  }

  lookupNameLonLat(lon, lat, depth) {
    return lookupNameRaDec(lon, lat, depth);
  }
}

export default HTMmap;
