import Monads from './monads';

const { Maybe } = Monads;

// -----
// utils
// -----

const log = (...args: any[]) => console.log(`=> ${args.join(' ')}`);

/**
 * calls and returns the result of either 'iftrue' or 'iffalse' functions
 * based on the result of the pred function evalutation
 */
const cond = (
  pred: (val: any) => boolean,
  iftrue: (val: any) => any,
  iffalse: (val: any) => any,
) => (val: any) => (pred(val) ? iftrue(val) : iffalse(val));

const isUndefined = (x: any) => x === undefined;

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

const getDataThatMayBeUndefined = (): Object | undefined => {
  const r: number = Math.random();

  switch (true) {
    case r <= 0.5:
      return {
        firstname: 'John',
        lastname: 'Doe',
        age: 21,
      };
    case r > 0.5:
      return undefined;
  }
};

const doubleAge = (x: any) => ({ ...x, age: x.age * 2 });

const maybeDoubleAge = (x: any) => Maybe.of({ ...x, age: x.age * 2 });

const data = cond(isUndefined, Nothing, Just)(getDataThatMayBeUndefined());
log(data); // => Just [object Object] | Nothing

data
  .map(doubleAge)
  .flatMap(maybeDoubleAge)
  .map(doubleAge)
  .map((x: any) => log(x.age)); // => 168
