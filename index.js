process.env.NODE_ENV ? true : process.env.NODE_ENV = 'production';
import express from 'express';
import config from './config/config.js';
import expressConfig from './config/express.js';
import mongooseConfig from './config/mongoose.js';
import routes from './router.js';
import errorHandler from './errorHandler.js';

const app = express();
expressConfig(app);
mongooseConfig(app);
app.use('/api', routes);
app.use(errorHandler);

app.listen(config.PORT, () => console.log(`Server is running on port ${config.PORT}... http://localhost:${config.PORT}/`));


