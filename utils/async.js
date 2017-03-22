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

  return list.reduce((p, item) => {
    if (found) {
      return p;
    } else {
      return p.then(() =>
        iteratee(item)
      ).then(result => {
        found = result;
      });
    }
  }, Promise.resolve()
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

module.exports = {
  sequence: sequence,
  find: find,
  retry: retry
};
