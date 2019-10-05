# royalty-payments
 System to record and calculate royalty payments owed to Rights Owners based on viewing activity of customers

# HOW TOs
To set up the project you need first to install: [node](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com/get-npm).

After that, just run ```npm ci```

## Available Env Vars
|Name|Description|
|---|---|
|LOG_LEVEL|Defines the log level. It could be: info, error, warning, debug, fatal. Default value: info|
|PORT|Specifies the port number in which the server will be listening. By default is 3000|
|REDIS_PORT|If you are NOT running the app in local mode (See next section) you can specify the port number of the real redis cache using this env var. By default is 6379|
|REDIS_HOST|If you are NOT running the app in local mode (See next section) you can specify the host name of the real redis cache using this env var. By default is 127.0.0.1|
## Testing the app
```npm test```

## Running the app
### Locally with in memory redis
```npm run local```
### Against a real redis cache
```npm start```