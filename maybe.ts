import Monads from "./monads";

const { Maybe } = Monads;

// -----
// utils
// -----

const log = (...args: any[]) => console.log(`=> ${args.join(" ")}`);

// -----
// examples
// -----

const { Just, Nothing } = Maybe;

let m = new Maybe(42);
log(m); // => Just 42

m = Just(42);
log(m); // => Just 42

m = Nothing(42);
log(m); // => Nothing

const double = (x: number) => x * 2;

m = Nothing(10)
  .map(double)
  .map(double);
log(m); // => Nothing

log(m.equals(Nothing())); // => true

m = Just(5)
  .map(double)
  .map(double);
log(m); // => Just 20

let b = Just(5)
  .map(double)
  .map(double)
  .equals(m);
log(b); // => true

let n = Just(5)
  .map(double)
  .map(double)
  .join();
log(n); // => 20
