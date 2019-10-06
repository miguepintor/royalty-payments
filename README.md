# royalty-payments
 System to record and calculate royalty payments owed to Rights Owners based on viewing activity of customers.
 The system is basically a REST api server and a store which can be an in-memory one or a redis cache.

# HOW TOs
## Prerequisites
To set up the project you need first to install: [node](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com/get-npm).

After that, just run:
```bash
npm ci
```

## Available Env Vars
|Name|Description|
|---|---|
|LOG_LEVEL|Defines the log level. It could be: info, error, warning, debug, fatal. Default value: info|
|PORT|Specifies the port number in which the server will be listening. By default is 3000|
|REDIS_PORT|If you are NOT running the app in local mode (See next section) you can specify the port number of the real redis cache using this env var. By default is 6379|
|REDIS_HOST|If you are NOT running the app in local mode (See next section) you can specify the host name of the real redis cache using this env var. By default is 127.0.0.1|
## Testing the app
Running the following command the syntax will be checked against eslint (airbnb style guide) and all tests will be executed. A coverage report will be shown and the end of the command.
```bash
npm test
```

## Running the app
### Locally with in memory redis
Just execute this command:
```bash
npm run local
```
### Against a real redis cache
Take into account that you could set up redis and the certain server properties through environment variables. To run the server against a real redis cache just execute this command:
```bash
npm start
```

# API specification
In docs folder you can find the api definition in `swagger.json` file. It is written down in swagger 2.0.
When the server is running the doc is also available in `\docs` endpoint.

# Deployment
In the `deployment` folder there is a script which allows you to deploy the system in ecs fargate service.
But first you will need to create the infrastructure which can be found in this [repo](https://github.com/miguepintor/royalty-payments-infrastructure).
After that it is just a matter of execute `deploy.sh`.