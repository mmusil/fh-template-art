"use strict";

function catchError(timeout, func) {
  let recordedError;
  const originalListener = replaceListener();

  return new Promise(function(resolve, reject) {
    func(resolve, reject);

    setTimeout(() => {
      reject('Project creation timed out');
    }, timeout);
  })
  .then(() => {
    revertListener();
  })
  .catch(error => {
    revertListener();
    throw error;
  });

  function replaceListener() {
    const originalListener = process.listeners('uncaughtException').pop();
    process.removeListener('uncaughtException', originalListener);
    process.once('uncaughtException', error => {
      recordedError = error;
    });
    return originalListener;
  }

  function revertListener() {
    if (recordedError) {
      console.error(recordedError);
    } else {
      const customListener = process.listeners('uncaughtException').pop();
      process.removeListener('uncaughtException', customListener);
    }
    process.on('uncaughtException', originalListener);
  }
}

module.exports = catchError;
