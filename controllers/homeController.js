// x = x.map(x => ({ ...x, createdAt: x.createdAt.toString().slice(0, 10) + x.createdAt.toString().slice(15, 24)}));
import Router from 'express';
import entityService from '../services/entityService.js';
import { TITLE_SERVER } from '../config/constants.js';

const router = Router();

router.get('/', (req, res, next) => {
    res.json({ message: 'It\'s working!' });
});

export default router;