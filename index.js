const store = require('./src/modules/store');
const logger = require('./src/modules/logger');
const app = require('./src/app')(store.redis(logger));

const port = process.env.PORT || 3000;

app.listen(port, () => { logger.info(`Server listening on port ${port}`); });
