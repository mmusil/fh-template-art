"use strict";

const Client = require('ssh2').Client;
const config = require('../config/buildfarm.json');
const path = require('path');
const fs = require('fs');

function cleanup(id) {
  return new Promise((resolve, reject) => {
    // Connect to digger with ssh and remove build
    const conn = new Client();
    conn.on('ready', () => {
      console.log('Connected to ios digger');
      removeBuild(id, conn)
        .then(() => {
          conn.end();
          resolve();
        })
        .catch(reject);
    }).connect({
      host: config.ios.host,
      port: 22,
      username: config.ios.user,
      privateKey: fs.readFileSync(path.resolve(__dirname, '..', config.ios.keyFile)),
      passphrase: config.ios.pass
    });
  });
}

function removeBuild(id, conn) {
  if (!id) {
    return Promise.reject('No ID');
  }

  // Skip incorrenct id
  if (/[^0-9a-z-]/g.test(id)) {
    return Promise.reject(`Wrong build id: ${id}`);
  }

  return new Promise((resolve, reject) => {
    console.log('Removing build ' + id + ':');
    conn.exec(`rm -rf /opt/feedhenry/fh-digger/data/built/${id}`, (err, stream) => {
      if (err) {
        return reject(err);
      }

      var stderr = '';

      stream.on('close', code => {
        if (code === 0) {
          console.log('Successfully removed!');
        } else {
          console.error('Error removing: ' + stderr);
        }
        resolve();
      }).on('data', () => {
      }).stderr.on('data', data => {
        stderr += data;
      });
    });
  });
}

module.exports = cleanup;
