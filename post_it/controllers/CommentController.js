const Comment = require('../models/Comment');
const User = require('../models/User');
const Post = require('../models/Post');
const { where } = require('sequelize');
module.exports = class CommentController{

    static async createComment(req,res){

        const {comment,postId} = req.body;
        
        const comments = {
            comment:comment,
            userId:req.session.userid,
            postId:postId
        }
        const post = await Comment.create(comments);
        res.redirect(`/comment/${post.postId}`);
    }
    static async comments(req,res){
        const id   = req.params.id;
        
        let post = await Post.findOne({raw:true,where:{id:id}});
        let user = await User.findOne({raw:true,where:{id:post.userId}});
        let commentlist = await Comment.findAll({where:{postId:post.id},
            order: [['createdAt','Desc']],
        });
        
        let comments = commentlist.map((result)=>result.get({plain:true}));
        let newComments = [];
        let commentLength;
        for(let i = 0; i < comments.length; i++){
            let myuser = await User.findOne({raw:true,where:{id:comments[i].userId}});
            newComments.push({comment:comments[i],user:myuser});
        }
        commentLength = comments.length;
        comments = newComments;
        let postuser = {post,user};
        console.log(commentLength )
        const page = 'Comentarios';
        res.render('pages/comment',{page,postuser,comments,commentLength});
    }
}