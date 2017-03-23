"use strict";

const config = require('../config/config');
const fhc = require('./fhc');

function cleanup() {
  if (!config.cleanup) {
    return;
  }

  console.log('Cleanup');

  return fhc.projectsListNoApps()
    .then(projects => {
      const projectsToDelete = projects.filter(project => project.title.startsWith(config.prefix));
      return projectsToDelete.reduce((p, proj) =>
        p.then(() => fhc.projectDelete(proj.guid).catch(console.error))
      , Promise.resolve());
    })
    .then(fhc.servicesList)
    .then(services => {
      const servicesToDelete = services.filter(service => service.title.startsWith(config.prefix));
      return servicesToDelete.reduce((p, service) =>
        p.then(() => fhc.serviceDelete(service.guid).catch(console.error))
      , Promise.resolve());
    });
}

module.exports = cleanup;
