redis = require('redis');
/* Values are hard-coded for this example, it's usually best to bring these in via file or environment variable for production */

function connectRedis() {
    client = redis.createClient({
        port: 6379,
        host: '127.0.0.1',
        retry_strategy: function(options) {
            if (options.error && options.error.code === "ECONNREFUSED") {
              // End reconnecting on a specific error and flush all commands with
              // a individual error
              return new Error("The server refused the connection");
            }
            if (options.total_retry_time > 1000 * 60 * 60) {
              // End reconnecting after a specific timeout and flush all commands
              // with a individual error
              return new Error("Retry time exhausted");
            }
            if (options.attempt > 10) {
              // End reconnecting with built in error
              return undefined;
            }
            // reconnect after
            return Math.min(options.attempt * 100, 3000);
          },
    });
    
    return client;
}

module.exports = {
    'connectRedis' : connectRedis()
};
