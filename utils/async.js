"use strict";

function sequence(list, iteratee) {
  const results = [];

  return list.reduce((p, item) =>
    p.then(() =>
      iteratee(item)
    ).then(result => {
      results.push(result);
    }),
    Promise.resolve()
  ).then(() =>
    results
  );
}

function find(list, iteratee) {
  let found = null;

  return list.reduce((p, item) =>
    p.then(() => {
      if (!found) {
        return iteratee(item)
          .then(result => {
            if (result) {
              found = item;
            }
          });
      }
    })
  , Promise.resolve()
  ).then(() =>
    found
  );
}

function retry(func, num) {
  let tries = 0;
  let done;
  let result;

  return tryAgain();

  function tryAgain() {
    tries += 1;
    return func()
      .then(res => {
        result = res;
        done = true;
      })
      .catch(error => {
        if (tries >= num) {
          throw error;
        }
      })
      .then(() => {
        if (done) {
          return result;
        } else {
          return tryAgain();
        }
      });
  }
}

function tryWithTimeout(ms, func) {
  return new Promise((resolve, reject) => {
    func().then(resolve, reject);

    setTimeout(() => {
      reject('Timed out');
    }, ms);
  });
}

function waitFor(ms, func) {
  let duration = 0;

  return waitForComplete();

  function waitForComplete() {
    return waitSec()
      .then(func)
      .then(complete => {
        if (!complete) {
          if (duration >= ms) {
            return Promise.reject('Timed out');
          }

          return waitForComplete();
        }
      });
  }

  function waitSec() {
    return new Promise(resolve => {
      setTimeout(() => {
        duration += 1000;

        resolve();
      }, 1000);
    });
  }
}

module.exports = {
  sequence: sequence,
  find: find,
  retry: retry,
  tryWithTimeout: tryWithTimeout,
  waitFor: waitFor
};
