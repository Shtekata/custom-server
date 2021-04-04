import { Router } from 'express';
import entityService from '../services/entityService.js';
import isAuth from '../middlewares/isAuth.js';
import { body, validationResult } from 'express-validator';
import {
    ENTITIES,
    ENTITY_NAME,
    TITLE_HOME,
    ENTITY_PROPERTY_ONE,
    ENTITY_PROPERTY_ONE_MIN_LENGTH,
    ENTITY_PROPERTY_TWO,
    ENTITY_PROPERTY_TWO_MIN_LENGTH,
    ENTITY_PROPERTY_TWO_MAX_LENGTH,
    ENTITY_PROPERTY_THREE,
    ENTITY_PROPERTY_THREE_MIN_LENGTH,
    ENTITY_PROPERTY_THREE_MAX_LENGTH,
} from '../config/constants.js';

const router = Router();

router.get('/', (req, res, next) => {
    entityService.getAll(req.params.id)
        .then(x => { res.status(200).json({ entities: x, msg: 'Successfully get entities!', token: res.locals.token }) })
        .catch(next)
});

router.get('/:id', (req, res, next) => {
    entityService.getOne(req.params.id)
        .then(x => { res.status(200).json({ entity: x, msg: 'Successfully get entity!', token: res.locals.token }) })
        .catch(next)
});

router.post('/',
    isAuth,
    body('title').trim()
        .notEmpty().withMessage(`Specify ${ENTITY_PROPERTY_ONE}!`)
        .isLength({ min: ENTITY_PROPERTY_ONE_MIN_LENGTH })
        .withMessage(`${ENTITY_PROPERTY_ONE} must be at least ${ENTITY_PROPERTY_ONE_MIN_LENGTH} characters!`),
    // .matches(ENGLISH_ALPHANUMERIC_PATTERN_WITH_SPACE)
    // .withMessage(ENGLISH_ALPHANUMERIC_MESSAGE + 'title!'),
    body('description').trim()
        .notEmpty().withMessage(`Specify ${ENTITY_PROPERTY_TWO}!`)
        .isLength({ min: ENTITY_PROPERTY_TWO_MIN_LENGTH, max: ENTITY_PROPERTY_TWO_MAX_LENGTH })
        .withMessage(`${ENTITY_PROPERTY_TWO} must be between ${ENTITY_PROPERTY_TWO_MIN_LENGTH} and ${ENTITY_PROPERTY_TWO_MAX_LENGTH} characters!`),
    body('solution').trim()
        .optional({ checkFalsy: true })
        .isLength({ min: ENTITY_PROPERTY_THREE_MIN_LENGTH, max: ENTITY_PROPERTY_THREE_MAX_LENGTH })
        .withMessage(`${ENTITY_PROPERTY_THREE} must be between ${ENTITY_PROPERTY_THREE_MIN_LENGTH} and ${ENTITY_PROPERTY_THREE_MAX_LENGTH} characters!`),
    body('isPublic').custom((value, { req }) => {
            if (value === 'on' || value === '') return true;
            throw {err:{msg:'isPublic not working properly!'}}; }),
    // body('imageUrl', 'Not valid image URL').isURL({ protocols: ['http', 'https'] }),
    // body('price').trim()
    //     .isFloat({ min: ENTITY_PROPERTY_THREE_MIN_LENGTH })
    //     .withMessage(`${ENTITY_PROPERTY_THREE} must be at least ${ENTITY_PROPERTY_THREE_MIN_LENGTH} value!`),
    (req, res, next) => {

        if (!validationResult(req).isEmpty()) {
            let err = {};
            const errors = validationResult(req).array();
            errors.forEach(x => err.msg = err.msg ? `${err.msg} ${x.msg}` : x.msg);
            throw ({ msg: err.msg, status: 403, body: req.body });
        };

        let data = req.body;
        data.isPublic = !!req.body.isPublic;
        data.creator = res.locals.user._id;
        entityService.createOne(data)
            .then(x => res.status(201).json({ _id: x._id, msg: 'Successfully created entity!', token: res.locals.token }))
            .catch(next);
    });

router.put('/:id', isAuth, (req, res, next) => {
    entityService.getOne(req.params.id)
        .then(x => {
            // if (x.creator != res.locals.user._id) throw {
            //     status: 401, msg: 'User is not a creator of entity!', username: res.locals.user.username, token: res.locals.token
            // };
            req.body.isPublic = !!req.body.isPublic;
            return entityService.updateOne(req.params.id, req.body);
        })
        .then(x => res.status(200).json({ entity: x, msg: 'Successfully updated entity!', token: res.locals.token }))
        .catch(next);
})

router.patch('/:id', isAuth, (req, res, next) => {
    entityService.getOne(req.params.id)
        .then(x => {
            req.body.isPublic = !!req.body.isPublic;
            return entityService.updateOne(req.params.id, req.body);
        })
        .then(x => res.status(200).json({ _id: x._id, msg: 'Successfully updated entity!', token: res.locals.token }))
        .catch(next);
})

router.delete('/:id', isAuth, (req, res, next) => {
    entityService.getOne(req.params.id)
        .then(x => {
            if (x.creator != res.locals.user._id) {
                const err = new Error('You are not author!');
                err.statusCode = 403;
                throw err;
            }
            return entityService.deleteOne(req.params.id)
        })
        .then(x => res.json({ _id: x._id, msg: 'Successfully delete entity!' }))
        .catch(next);
})

router.get('/like/:id', isAuth, async (req, res, next) => {
    const id = req.params.id;
    const userId = res.locals.user._id;
    entityService.like(id, userId)
        .then(x => res.redirect(`/${ENTITIES}/details/${id}`))
        .catch(x => { req.session.err = x; res.redirect(`/${ENTITIES}/details/${id}`)})
});

router.get('/sortByDate', isAuth, async (req, res, next) => {
    entityService.getAllAsc()
        .then(x => {
            x.forEach(x => x.usersLiked = x.usersLiked.length);
            res.render('home/home', { title: TITLE_HOME, plays: x, user: res.locals.user })
        })
});

router.get('/sortByLikes', isAuth, async (req, res, next) => {
     entityService.getAllLikesDesc(req.query.search)
        .then(x => {
            x.forEach(y => y.usersLiked = y.usersLiked.length);
            x.sort((x, y) => y.usersLiked - x.usersLiked);
            res.render('home/home', { title: TITLE_HOME, plays: x, user: res.locals.user })
        })
        .catch(next);
});

export default router;