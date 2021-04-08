import { Router } from 'express';
import authService from '../services/authService.js';
import isGuest from '../middlewares/isGuest.js';
import isAuth from '../middlewares/isAuth.js';
import { body, validationResult } from 'express-validator';
import {
    ENGLISH_ALPHANUMERIC_PATTERN,
    ENGLISH_ALPHANUMERIC_MESSAGE,
    USERNAME_MIN_LENGTH,
    PASSWORD_CONFIRMATION_ERR,
} from '../config/constants.js';

const router = Router();

router.post('/login', isGuest, (req, res, next) => {
    const { username, email, password } = req.body;
    authService.login({ username, password })
        .then(x => res.status(200).json({
            message: 'User successfully loged in!',
            token: x[1],
            userId: x[2]._id.toString(),
            username: x[2].username
        }))
        .catch(x => next(x));
});

router.post('/register',
    isGuest,
    body('username').trim()
        .notEmpty().withMessage('Specify username!')
        .isLength({ min: USERNAME_MIN_LENGTH }).withMessage(`Username must be at least ${USERNAME_MIN_LENGTH} characters!`)
        .matches(ENGLISH_ALPHANUMERIC_PATTERN).withMessage(ENGLISH_ALPHANUMERIC_MESSAGE + 'username!'),
    body('password').trim()
        .notEmpty().withMessage('Specify password!')
        .isStrongPassword({ minLength: 6, minLowercase: 1, minUppercase: 0, minNumbers: 1, minSymbols: 0 }),
    body('rePassword').custom((value, { req }) => {
        if (value === req.body.password) return true;
        throw PASSWORD_CONFIRMATION_ERR; }),
    body('email').trim()
        // .optional({ checkFalsy: true })
        .isEmail().withMessage('Not valid email!'),
    (req, res, next) => {
        const { username, password, email } = req.body;

        if (!validationResult(req).isEmpty()) {
            let err = {};
            const errors = validationResult(req).array();
            errors.forEach(x => err.msg = err.msg ? `${err.msg}\n${x.msg}` : x.msg);
            return res.json({ err, body: req.body });
        };
        
        authService.register({ username, email, password })
            .then(x => authService.login({ username, password }))
            .then(x => res.status(200).json({
                message: 'User successfully loged in!',
                token: x[1],
                userId: x[2]._id.toString(),
                username: x[2].username
            }))
            .catch(next);
    });

router.get('/logout', isAuth, (req, res, next) => {
    authService.logout(res.locals.user.username)
        .then(x => res.status(200).json({
            _id: x._id,
            message: 'User successfully loged out!'
        }))
        .catch(next);
});

router.get('/:_id', isAuth, (req, res, next) => {
    authService.getUser(req.params._id)
        .then(x => res.status(200).json({
            message: 'Get User successfully!',
            token: x.token,
            userId: x._id.toString(),
            username: x.username,
            user: x
        }))
        .catch(x => next(x));
});

export default router;