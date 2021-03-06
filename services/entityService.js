import User from '../models/User.js';
import Entity from '../models/Entity.js';
import authService from './authService.js';

function getAll(query) {
    return Entity.find()
        .where({ query })
        .populate('creator')
        .populate('executor');
}

function getAllAsc(query) {
    return Entity.find()
        .where({ query })
        // .where({ title: { $regex: query || '', $options: 'i' } })
        .sort('createdAt')
        .populate('creator')
        .populate('executor');
}

function getAllDesc(query) {
    return Entity.find()
        .where(query)
        // .where({ title: { $regex: query || '', $options: 'i' } })
        .sort('-executedOn')
        .populate('creator')
        .populate('executor');
};

function getAllLikesDesc(query) {
    // return Entity.find().setOptions({ lean: true })
    //     .where({ title: { $regex: query || '', $options: 'i' } })
    //     .sort('-usersLiked');
    return Entity.aggregate([
        {
            '$project': {
                'title': 1,
                'description': 1,
                'imageUrl': 1,
                'isPublic': 1,
                'createdAt': 1,
                'creator': 1,
                'usersLiked': 1,
                'usersLikedLength': { '$size': '$usersLiked' }
            }
        },
        { '$sort': { 'usersLikedLength': -1 } }
    ]);
};

function getOne(id) {
    return Entity.findById(id)
        .then(x => {
            if (!x) {
                const err = new Error('Entity not found!');
                err.statusCode = 404;
                throw err;
            }
            return x
        });
}

function getOneWithAccessories(id) {
    return Entity.findById(id).populate('accessories');
}

function createOne(data) {
    const entity = new Entity({ ...data });
    return new Promise((resolve, reject) => {
        entity.save()
            .then(x => resolve(x))
            .catch(x => {
                let err = {};
                if (!x.errors) err.msg = x.message;
                else {
                    Object.keys(x.errors).map(y =>
                        err.msg = err.msg ? `${err.msg}\n${x.errors[y].message}` : x.errors[y].message
                    );
                }
                reject(err)
            });
    });
}

function updateOne(entityId, data) {
    return authService.getUserByUsername(data.user)
        .then(x => {
            if (x) {
                data.executor = x;
                data.executedOn = new Date();
            }
            return Entity.findByIdAndUpdate({ _id: entityId }, data, { new: true, useFindAndModify: false });
        })
        .catch(x => {
            let err = {};
            if (!x.errors) err.msg = x.message;
            else {
                Object.keys(x.errors).map(y =>
                    err.msg = err.msg ? `${err.msg}\n${x.errors[y].message}` : x.errors[y].message
                );
            }
            throw err;
        });
    
}

function deleteOne(id) {
    return new Promise((resolve, reject) => {
        Entity.findByIdAndDelete(id)
            .then(x => resolve(x))
            .catch(x => {
                let err = {};
                if (!x.errors) err.msg = x.message;
                else {
                    Object.keys(x.errors).map(y =>
                        err.msg = err.msg ? `${err.msg}\n${x.errors[y].message}` : x.errors[y].message
                    );
                }
                reject(err);
            });
    });
}

async function like(id, userId) {
    const user = await User.findById(userId);
    const entity = await Entity.findById(id);

    user.likedPlays.push(entity);
    entity.usersLiked.push(user);
    const resultUser = user.save();
    const resultEntity = entity.save();
    
    return Promise.all([resultUser, resultEntity]);
}

function getUserEntities(id) {
    return Entity.find({ creator: id });
}

export default {
    getAll,
    getAllAsc,
    getAllDesc,
    getAllLikesDesc,
    getOne,
    getOneWithAccessories,
    createOne,
    updateOne,
    deleteOne,
    like,
    getUserEntities
};