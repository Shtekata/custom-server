import { Router } from 'express';
import authService from '../services/authService.js';
import entityService from '../services/entityService.js';
import config from '../config/config.js';
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
const COOKIE_NAME = config.COOKIE_NAME;

router.get('/login', isGuest, (req, res) => {
    res.render('auth/login', { title: 'Login Page' });
});
router.post('/login', (req, res) => {
    const { username, email, password } = req.body;
    authService.login({ username, password })
        .then(x => { res.cookie('AAA', x.token).status(200).json({ message: 'User successfully loged in!', token: x.token, userId: x.userId }) })
        .catch(x => res.json({ err: x.msg }));
});

router.get('/register', isGuest, (req, res) => {
    res.render('auth/register', { title: 'Register Page' });
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
            .then(x => { res.json({ _id: x._id }) })
            .catch(x => res.json({ err: x.msg }));
    });

router.get('/logout', isAuth, (req, res) => {
    res.clearCookie(COOKIE_NAME);
    res.redirect('/');
});

router.get('/profile/:id', (req, res, next) => {
    authService.getUserWithOffersBought(req.params.id)
        .then(x => {
            x.totalCost = 0;
            x.offersBought.map(y => x.totalCost += y.price);
            x.offersBoughtCount = x.offersBought.length;
            return x;
        })
        .then(x => {
            return entityService.getUserEntities(req.params.id)
                .then(y => {
                    x.totalProfit = 0;
                    x.mySalesCount = 0;
                    x.offersSaled = y;
                    y.map(z => {
                        x.totalProfit += z.buyers.length * z.price;
                        x.mySalesCount += z.buyers.length;
                    });
                    x.myOffersCount = y.length;
                    x.totalProfit = x.totalProfit.toFixed(2);
                    return x;
                });
        })
        .then(x => res.render('auth/profile', x))
        .catch(next);
});

export default router;