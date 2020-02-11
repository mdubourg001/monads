abstract class Monad<T> {
  protected value: T;
}

// -----
// maybe monad
// -----

class Maybe<T> extends Monad<T> {
  constructor(val: T | null) {
    super();
    this.value = val;
  }

  static Just<T>(val: T): Maybe<T> {
    return new Maybe(val);
  }

  static Nothing<T>(val?: T): Maybe<T> {
    return new Maybe(null);
  }

  static of<T>(val: T): Maybe<T> {
    return Maybe.Just(val);
  }

  map<B>(f: (val: T) => B): Maybe<T | B> {
    return this.isNothing() ? this : new Maybe(f(this.value));
  }

  join(): T {
    return this.value;
  }

  isNothing(): boolean {
    return this.value === null;
  }

  equals(m: Maybe<T>): boolean {
    return this.value === m.join();
  }

  toString(): string {
    return this.isNothing() ? 'Nothing' : `Just ${this.value}`;
  }
}

// -----
// either monad
// -----

enum EitherType {
  Left = 'Left',
  Right = 'Right',
}

class Either<T> extends Monad<T> {
  private t: EitherType;

  constructor(val: T, t: EitherType = EitherType.Right) {
    super();
    this.value = val;
    this.t = t;
  }

  static of<T>(val: T): Either<T> {
    return new Either(val);
  }

  static Left<T>(val: T): Either<T> {
    return new Either(val, EitherType.Left);
  }

  static Right<T>(val: T): Either<T> {
    return new Either(val);
  }

  map<B>(f: (val: T) => B): Either<T | B> {
    return this.t === EitherType.Left ? this : new Either(f(this.value));
  }

  either<B>(lmap: (val: T) => B, rmap: (val: T) => B): B {
    return this.t === EitherType.Left ? lmap(this.value) : rmap(this.value);
  }

  isLeft(): boolean {
    return this.t === EitherType.Left;
  }

  isRight(): boolean {
    return !this.isLeft();
  }

  private isSameTAs(m: Either<T>): boolean {
    return (this.isLeft() && m.isLeft()) || (this.isRight() && m.isRight());
  }

  private isSameValueAs(val: T): boolean {
    return this.value === val;
  }

  equals(m: Either<T>): boolean {
    return (
      this.isSameTAs(m) && m.either(this.isSameValueAs, this.isSameValueAs)
    );
  }

  toString(): string {
    return `${this.t} ${this.value}`;
  }
}

// -----
// io monad
// -----

type Effect<T> = () => T;

class IO<T> extends Monad<Effect<T>> {
  constructor(val: Effect<T>) {
    super();
    this.value = val;
  }

  static of<T>(val: Effect<T>): IO<T> {
    return new IO(val);
  }

  map<B>(f: (val: T) => B): IO<B> {
    return new IO(() => f(this.eval()));
  }

  asyncMap<B>(f: (val: T) => Promise<B>): IO<Promise<B>> {
    return new IO(async () => f(await this.eval()));
  }

  flatMap<B>(f: (val: T) => IO<B>): IO<B> {
    return new IO(() => f(this.eval()).eval());
  }

  asyncFlatMap<B>(f: (val: T) => IO<Promise<B>>): IO<Promise<B>> {
    return new IO(async () => f(await this.eval()).eval());
  }

  eval(): T {
    return this.value();
  }

  toString(): string {
    return `IO ${typeof this.value}`;
  }
}

export default {
  Maybe,
  Either,
  IO,
};
