// -----
// development utils
// -----

// just a formatted console.log
const log = (...args: any[]) => console.log(`=> ${args.join(' ')}`);

// logs and returns the exact given argument
const tapLog = (x: any): any => {
  log(x);
  return x;
};

// -----
// real stuff
// -----

// returns the exact same argument given
const identity = (x: any): any => x;

// for examples purpose
const double = (x: number) => x * 2;

// calls and returns the result of either 'iftrue' or 'iffalse' functions
// based on the result of the pred function evalutation
const cond = (
  pred: (val: any) => boolean,
  iftrue: (val: any) => any,
  iffalse: (val: any) => any,
) => (val: any) => (pred(val) ? iftrue(val) : iffalse(val));

log(cond((x: number) => x < 0.5, double, identity)(0.4)); // => 0.8

// returns a function that flows results from the left to the right
const pipe = (...fns: Function[]): Function =>
  fns.reduce(
    (prevFn, nextFn) => (...args: any[]) => nextFn(prevFn(...args)),
    identity,
  );

// returns a function that flows results from the right to the left
const compose = (...fns: Function[]): Function =>
  fns.reduceRight(
    (prevFn, nextFn) => (...args: any[]) => nextFn(prevFn(...args)),
    identity,
  );

// pipe usage example
pipe(
  double,
  tapLog, // => 20
  double,
  tapLog, // => 40
  double,
  tapLog, // => 80
)(10);

// compose usage example
compose(
  double,
  tapLog, // => 40
  double,
  tapLog, // => 20
  double,
  tapLog, // => 10
)(10);

// makes n unary functions out of f, that accepts n arguments
const curry = (f: Function, i = f.length): Function =>
  i > 1 ? (arg: any) => curry((...args: any[]) => f(arg, ...args), i - 1) : f;

// -----
// curry usage example
// -----

const crossProduct = (rightDen: number, leftNum: number, leftDen: number) =>
  (leftNum * rightDen) / leftDen;

const asPercents = curry(crossProduct)(100);

// 12 / 30 as percents
log(asPercents(12)(30)); // => 40
// 33 / 60 as percents
log(asPercents(33)(60)); // => 55

// create a function by reducing arity of another function
const partial = (f: Function, ...allArgs: any[]): Function => (
  ...missingArgs: any[]
) => {
  let i = 0;
  return f(...allArgs.map(a => (a === partial ? missingArgs[i++] : a)));
};

// -----
// partial application usage example
// -----

// partial considers itself (reference) as the placeholder, so
const _ = partial;
const partialAsPercents = partial(crossProduct, _, 33, _);

// 33 / 66 as percents
log(partialAsPercents(100, 66)); // => 50
