/*jslint node: true */
/*jslint esversion: 6 */

'use strict';

var Hapi = require('hapi');
var Inert = require('inert');
var argv = require('yargs').argv;
var path = require('path');

var server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: path.join(__dirname, '../')
            }
        }
    }
});

server.connection({
    port: argv.p || 3000
});

server.register(Inert, () => {});

var routers = [
    require('./routes/static'),
    require('./routes/system'),
    require('./routes/processor'),
    require('./routes/memory'),
    require('./routes/disks'),
    require('./routes/network'),
    require('./routes/processes'),
    require('./routes/bandwidth')
];

routers.forEach(function (router) {
    router.forEach(function (route) {
        server.route(route);
    });
});

server.start((err) => {
    if (err) {
        throw err;
    }

    console.log('Server running at:', server.info.uri);
});
