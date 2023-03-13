const {DataTypes} = require('sequelize');
const db          = require('../db/conn');
const Post        = require('../models/Post');
const Following   = require('../models/Following');

const User = db.define('user',{
    username:{
        type: DataTypes.STRING,
        allowNull: false
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false
    },
    description:{
        type: DataTypes.STRING,
        allowNull: true
    }
});

Post.belongsTo(User);
User.hasMany(Post);

Following.belongsTo(User);
User.hasMany(Following);

module.exports = User;
