var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'cardgame'
    },
    port: 3000,
    db: 'mongodb://localhost/cardgame-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'cardgame'
    },
    port: 3000,
    db: 'mongodb://localhost/cardgame-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'cardgame'
    },
    port: 3000,
    db: 'mongodb://localhost/cardgame-production'
  }
};

module.exports = config[env];
