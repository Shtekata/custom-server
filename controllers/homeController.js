import Router from 'express';
import entityService from '../services/entityService.js';
import { TITLE_SERVER } from '../config/constants.js';

const router = Router();

router.get('/', (req, res, next) => {
    res.json({ message: 'It\'s working!', processEnvMongoUser: process.env.MONGO_USER, processEnvMongoPass: process.env.MONGO_PASS });
});

router.post('/', (req, res, next) => {
    console.log(req.body);
    res.json({ Hello: 'From Mars' });
});

export default router;