import User from '../models/User.js';
import Entity from '../models/Entity.js';

function getAll(query) {
    return Entity.find()
        .where({ title: { $regex: query || '', $options: 'i' } })
        .populate('creator');
}

function getAllAsc(query) {
    return Entity.find()
        .where({ title: { $regex: query || '', $options: 'i' } })
        .sort('createdAt');
}

function getAllDesc(query) {
    return Entity.find()
        .where({ title: { $regex: query || '', $options: 'i' } })
        .sort('-createdAt');
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
    return new Promise((resolve, reject) => {
        Entity.findByIdAndUpdate({ _id: entityId }, data, { useFindAndModify: false, new: true })
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