import config from '../config/config.js';
import jwt from 'jsonwebtoken';

const COOKIE_NAME = config.COOKIE_NAME;
const SECRET = config.SECRET;

export default function () {
    return (req, res, next) => {
        const token = req.get('Authorization')?.split(' ')[1];
        if (token && token != 'undefined'){
            jwt.verify(token, SECRET, (e, x) => {
                if (e) next(e);
                res.locals.user = x;
            });
        }
        next();
    }
}