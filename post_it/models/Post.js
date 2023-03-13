const {DataTypes} = require('sequelize');
const db          = require('../db/conn')
const Comment     = require('../models/Comment');

const Post = db.define('post',{
    title:{
        type: DataTypes.STRING,
        allowNull: false
    },
    content:{
        type: DataTypes.TEXT,
        allowNull: false
    }
});

Comment.belongsTo(Post);
Post.hasMany(Comment);


module.exports = Post;