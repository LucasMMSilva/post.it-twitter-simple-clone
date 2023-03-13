const Post     = require('../models/Post');
const User     = require('../models/User');
const Comment  = require('../models/Comment');
const Following  = require('../models/Following');
const {Op}     = require('sequelize');
module.exports = class PostController{

    static async showcreatepost(req,res){
        res.render('pages/createpost');
    }
    static async saveCreatePost(req,res){
        
        const {title,content} = req.body;
        const post = {
            title,
            content,
            userId:req.session.userid
        }
        await Post.create(post);

        res.redirect('/');
    }
    static async showhome(req,res){
        const page = 'Pagina Inicial';
        const userId = req.session.userid;
        let following = await Following.findAll({where:{userId:userId},attributes: ['followedId']})
        const followingmap = following.map((result)=>result.get({plain:true}));
        const followings = followingmap.map((result)=>{
            return{
                userId: result.followedId
            }
        });
        followings.push({userId: userId})

        const post = await Post.findAll({where:{
            [Op.or]:followings
        },
            order: [['createdAt','Desc']],
            include: [{
                model: User
            }]
        });
        const postMaping = post.map((result)=>result.get({plain:true}));

        for(let i = 0; i < postMaping.length;i++){
            const postcomments = await Comment.findAll({raw:true,where:{postId:postMaping[i].id}})
            postMaping[i].commentLength = postcomments.length
        }

        let haspost
        if(postMaping.length > 0){
            haspost = true;
        }else{
            haspost = false;
        }
 
        res.render('pages/home',{page,postMaping,haspost});
    }
    static async explore(req,res){
        const page = 'Explorar';
        const post = await Post.findAll({
            order: [['createdAt','Desc']],
            include: [{
                model: User
            }]
        });
        const postMaping = post.map((result)=>result.get({plain:true}));

        for(let i = 0; i < postMaping.length;i++){
            const postcomments = await Comment.findAll({raw:true,where:{postId:postMaping[i].id}})
            postMaping[i].commentLength = postcomments.length
        }
        let haspost
        if(postMaping.length > 0){
            haspost = true;
        }else{
            haspost = false;
        }
        
        res.render('pages/explore',{page,postMaping,haspost});
    }
}
