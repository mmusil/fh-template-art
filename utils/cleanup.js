"use strict";

const config = require('../config/common.json');
const fhc = require('./fhc');
const async = require('./async');

function cleanup() {
  return fhc.projectsListNoApps()
    .then(projects => {
      const projectsToDelete = projects.filter(project =>
        project.title.startsWith(config.prefix)
      );

      async.sequence(projectsToDelete, proj => {
        console.log(`Deleting ${proj.title}`);

        return fhc.projectDelete(proj.guid).catch(console.error);
      });
    })
    .then(fhc.servicesList)
    .then(services => {
      const servicesToDelete = services.filter(service =>
        service.title.startsWith(config.prefix)
      );

      async.sequence(servicesToDelete, service => {
        console.log(`Deleting ${service.title}`);

        return fhc.serviceDelete(service.guid).catch(console.error);
      });
    });
}

fhc.init(config.host, config.username, config.password)
  .then(cleanup)
  .catch(console.error);
