import Monads from "./monads";

const { Either } = Monads;

// -----
// utils
// -----

const log = (...args: any[]) => console.log(`=> ${args.join(" ")}`);

const error = (...args: any[]) => console.log(`=> ERROR ${args.join(" ")}`);

const cond = (
  pred: (val: any) => boolean,
  iftrue: (val: any) => any,
  iffalse: (val: any) => any
) => (val: any) => (pred(val) ? iftrue(val) : iffalse(val));

// -----
// examples
// -----

const { Left, Right } = Either;

let e = new Either(42);
log(e); // => Right 42

e = Left(42);
log(e); // => Left 42

const double = (x: number) => x * 2;

const right = Right(10).map(double);
log(right); // => Right 20

const left = Left(10).map(double);
log(left); // => Left 10

right.either(error, log); // => 20
left.either(error, log); // => ERROR 10

const getDataOfUnknownType = (): unknown => {
  const r: number = Math.random();

  switch (true) {
    case r <= 0.33:
      return 42;
    case r > 0.33 && r <= 0.66:
      return "Hello World!";
    case r > 0.66:
      return true;
  }
};

const isNumber = (x: any): boolean => typeof x === "number";

const data = cond(isNumber, Right, Left)(getDataOfUnknownType());
log(data); // => Right 42 | Left "Hello World" | Left true

data
  .map(double)
  .map(double)
  .either(
    (x: any) => error(`Value of type '${typeof x}' isn't accepted.`),
    log
  );
