const fs = require('fs');

import Monads from './monads';

const { IO } = Monads;

// -----
// utils
// -----

const log = (...args: any[]) => console.log(`=> ${args.join(' ')}`);

const identity = (x: any): any => x;

const pipe = (...fns: Function[]): Function =>
  fns.reduce(
    (prevFn, nextFn) => (...args) => nextFn(prevFn(...args)),
    identity,
  );

const tapLog = (x: any): any => {
  log(x);
  return identity(x);
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
    .map(files => files.filter(filename => filename.endsWith(ext)).length)
    .flatMap(count => writeFileSyncIO(`count.txt`, count.toString(), 'utf8'))
    .flatMap(() => readFileSyncIO(`count.txt`, 'utf8'));

log(countAndWriteFilesWithExt('.json').eval());

// async usage

const fetchDataIO = () => IO.of(() => Promise.resolve(42));
const fetchMoreDataIO = () => IO.of(() => Promise.resolve('Am some API data!'));

const asyncTasksMess = fetchDataIO()
  .asyncMap(data => data * 2)
  .asyncFlatMap(data =>
    writeFileSyncIO(`data.txt`, JSON.stringify(data), 'utf8'),
  )
  .asyncFlatMap(() => readFileSyncIO(`data.txt`, 'utf8'))
  .asyncMap(log) // => 84
  .asyncFlatMap(() => fetchMoreDataIO())
  .asyncFlatMap(data =>
    writeFileSyncIO(`data.txt`, JSON.stringify(data), 'utf8'),
  )
  .asyncFlatMap(() => readFileSyncIO(`data.txt`, 'utf8'));

asyncTasksMess.eval().then(log); // => 'Am some API data!'
