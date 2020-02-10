abstract class Monad<T> {
  protected value: T;

  abstract of(val: T): Monad<T>;
  abstract map<B>(f: (val: T) => B): Monad<T | B>;
  abstract equals(m: Monad<T>): boolean;
  abstract toString(): string;
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

  of(val: T): Maybe<T> {
    return Maybe.of(val);
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
    return this.isNothing() ? "Nothing" : `Just ${this.value}`;
  }
}

// -----
// either monad
// -----

enum EitherType {
  Left = "Left",
  Right = "Right"
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

  of(val: T): Either<T> {
    return Either.of(val);
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

export default {
  Maybe,
  Either
};
