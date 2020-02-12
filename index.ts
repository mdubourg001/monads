import * as fs from 'fs';

import Monads from './monads';

const { IO } = Monads;

// -----
// utils
// -----

const log = (...args: any[]) => console.log(`=> ${args.join(' ')}`);

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

// sync usage

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

// async usage

let fetchDataIO = () => IO.of(() => Promise.resolve(42));
let fetchMoreDataIO = () => IO.of(() => Promise.resolve('Am some API data!'));

const asyncTasksMess = fetchDataIO()
  .asyncMap(data => data * 2)
  .asyncFlatMap((data: any) =>
    writeFileSyncIO(`data.txt`, JSON.stringify(data), 'utf8'),
  )
  .asyncFlatMap(() => readFileSyncIO(`data.txt`, 'utf8'))
  .asyncMap(log) // => 84
  .asyncFlatMap(() => fetchMoreDataIO())
  .asyncFlatMap((data: any) =>
    writeFileSyncIO(`data.txt`, JSON.stringify(data), 'utf8'),
  )
  .asyncFlatMap(() => readFileSyncIO(`data.txt`, 'utf8'));

asyncTasksMess.eval().then(log); // => 'Am some API data!'

// async with error handling

fetchDataIO = () =>
  IO.of(
    randBetween(
      () => Promise.resolve({ status: 200, data: 10 }),
      () => Promise.reject({ status: 500, error: 'Internal server error.' }),
    ),
  ); // same chances to fail or succeed ;
fetchMoreDataIO = () =>
  IO.of(
    randBetween(
      () => Promise.resolve({ status: 200, data: 'Am some API data' }),
      () => Promise.reject({ status: 500, error: 'Internal server error.' }),
    ),
  ); // same chances to fail or succeed ;;

const unsafeAsyncTasksMess = fetchDataIO()
  .asyncMap(data => data * 2)
  .asyncFlatMap((data: any) =>
    writeFileSyncIO(`data.txt`, JSON.stringify(data), 'utf8'),
  )
  .asyncFlatMap(() => readFileSyncIO(`data.txt`, 'utf8'))
  .asyncMap(log) // => 20
  .asyncFlatMap(() => fetchMoreDataIO())
  .asyncFlatMap((data: any) =>
    writeFileSyncIO(`data.txt`, JSON.stringify(data), 'utf8'),
  )
  .asyncFlatMap(() => readFileSyncIO(`data.txt`, 'utf8'));

asyncTasksMess.eval().then(log); // => 'Am some API data!'

unsafeAsyncTasksMess
  .eval()
  .then(log) // => 20
  .catch(r => log(r.error)); // => 'Am some API data!'
