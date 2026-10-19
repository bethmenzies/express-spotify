const config = require('./config'); // Import your configuration file

const globalTeardown = async () => {
  if (config.Memory) { // Config to decide if an mongodb-memory-server instance should be used
    const instance = global.__MONGOINSTANCE;
    await instance.stop();
  }
};

module.exports = globalTeardown;