import * as fs from 'fs';

import Monads from './monads';

const { IO } = Monads;

// -----
// utils
// -----

const log = (...args: any[]) => console.log(`=> ${args.join(' ')}`);

const tapLog = (x: any): any => {
  log(x);
  return x;
};

const randBetween = (...args: Array<any>): any => {
  const rand = Math.random();
  const step = 1 / args.length;
  return args.find((a, index) => {
    if (rand >= index * step && rand < (index + 1) * step) return a;
  });
};

// -----
// examples
// -----

// -----
// sync usage
// -----

const readdirSyncIO = (...args: any[]) => IO.of(() => fs.readdirSync(...args));
const readFileSyncIO = (...args: any[]) =>
  IO.of(() => fs.readFileSync(...args));
const writeFileSyncIO = (...args: any[]) =>
  IO.of(() => fs.writeFileSync(...args));

const countAndWriteFilesWithExt = (ext: string): IO<string> =>
  readdirSyncIO('./')
    .map(
      files => files.filter((filename: any) => filename.endsWith(ext)).length,
    )
    .flatMap(count => writeFileSyncIO(`count.txt`, count.toString(), 'utf8'))
    .flatMap(() => readFileSyncIO(`count.txt`, 'utf8'));

log(countAndWriteFilesWithExt('.json').eval());

// -----
// async usage with error handling
// -----

const unsafefetchDataIO = () =>
  IO.of(
    randBetween(
      () => tapLog('1 worked') && Promise.resolve({ status: 200, data: 10 }),
      () =>
        tapLog('1 failed') &&
        Promise.reject({ status: 500, error: 'Internal server error.' }),
    ),
  ); // same chances to fail or succeed ;

const unsafefetchMoreDataIO = () =>
  IO.of(
    randBetween(
      () =>
        tapLog('2 worked') &&
        Promise.resolve({ status: 200, data: 'Am some API data' }),
      () =>
        tapLog('2 failed') &&
        Promise.reject({ status: 500, error: 'Internal server error.' }),
    ),
  ); // same chances to fail or succeed ;;

const asyncTasksMess = unsafefetchDataIO()
  .asyncMap(res => ({ ...res, data: res.data * 2 }))
  .asyncFlatMap((data: any) =>
    writeFileSyncIO(`data.txt`, JSON.stringify(data), 'utf8'),
  )
  .asyncFlatMap(() => readFileSyncIO(`data.txt`, 'utf8'))
  .asyncMap(log) // => { status: 200, data: 20 }
  .asyncFlatMap(() => unsafefetchMoreDataIO())
  .asyncFlatMap((data: any) =>
    writeFileSyncIO(`data.txt`, JSON.stringify(data), 'utf8'),
  )
  .asyncFlatMap(() => readFileSyncIO(`data.txt`, 'utf8'));

asyncTasksMess
  .eval()
  .then(log) // => { status: 200, data: "Am some API data" }
  .catch(e => log(e.error)); // => Internal server error.
