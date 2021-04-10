import { Router } from 'express';
import entityService from '../services/entityService.js';
import isAuth from '../middlewares/isAuth.js';
import { body, validationResult } from 'express-validator';
import {
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
    entityService.getAllDesc(req.query)
        .then(x => res.status(200).json({
            msg: 'Successfully get entities!',
            token: res.locals.token,
            entities: x
        }))
        .catch(next)
});

router.get('/:id', (req, res, next) => {
    entityService.getOne(req.params.id)
        .then(x => res.status(200).json({
            msg: 'Successfully get entity!',
            token: res.locals.token,
            entity: x
        }))
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
            if (value === 'on' || value === '' || value === undefined) return true;
            throw 'isPublic not working properly!'; }),
    // body('imageUrl', 'Not valid image URL').isURL({ protocols: ['http', 'https'] }),
    // body('price').trim()
    //     .isFloat({ min: ENTITY_PROPERTY_THREE_MIN_LENGTH })
    //     .withMessage(`${ENTITY_PROPERTY_THREE} must be at least ${ENTITY_PROPERTY_THREE_MIN_LENGTH} value!`),
    (req, res, next) => {

        if (!validationResult(req).isEmpty()) {
            let err = {};
            const errors = validationResult(req).array();
            errors.forEach(x => err.msg = err.msg ? `${err.msg} ${x.msg}` : x.msg);
            
        };

        let data = req.body;
        data.isPublic = !!req.body.isPublic;
        data.creator = res.locals.user._id;
        entityService.createOne(data)
            .then(x => res.status(201).json({
                msg: 'Successfully created entity!',
                _id: x._id,
                token: res.locals.token,
                entity: x
            }))
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
        .then(x => res.status(200).json({
            msg: 'Successfully updated entity!',
            _id: x._id,
            token: res.locals.token,
            entity: x
        }))
        .catch(next);
})

router.patch('/:id', isAuth, (req, res, next) => {
    entityService.getOne(req.params.id)
        .then(x => {
            req.body.isPublic ? !!req.body.isPublic : true;
            return entityService.updateOne(req.params.id, req.body);
        })
        .then(x => res.status(200).json({
             msg: 'Successfully updated entity!',
            _id: x._id,
            token: res.locals.token,
            entity: x
        }))
        .catch(next);
})

router.delete('/:id', isAuth, (req, res, next) => {
    entityService.getOne(req.params.id)
        .then(x => {
            // if (x.creator != res.locals.user._id) {
            //     throw { msg: 'You are not author!', status: 403, token: res.locals.token, username: res.locals.user?.username };
            // }
            return entityService.deleteOne(req.params.id)
        })
        .then(x => res.json({
            msg: 'Successfully delete entity!',
            _id: x._id,
            token: res.locals.token,
            entity: x
        }))
        .catch(next);
})

export default router;