const Comment = require('../models/Comment');
const User = require('../models/User');
const Post = require('../models/Post');
const PostController = require('./PostController');
module.exports = class CommentController{

    static async createComment(req,res){

        const {comment,postId} = req.body;
        
        const comments = {

            comment:comment,
            userId:req.session.userid,
            postId:postId

        };

        if(comment != ""){

            const post = await Comment.create(comments)
            .then(()=>{
                req.session.message = {type:'success',text:'Obrigado pela sua interação!'}
            })
            .catch((err)=>{
                console.log(err);
            });

        }else{
            req.session.message = {type:'warning',text:'Por favor preencha o campo para prosseguir!'}
            
        } 
        req.session.save(() => {
            res.redirect(`/comment/${postId}`)
        })
    }

    static async comments(req,res){

        const myId = req.session.userid;
        const id   = req.params.id;
        
        let post = await Post.findOne({raw:true,where:{id:id}}).then().catch((err)=>{console.log(err)});
        let user = await User.findOne({raw:true,where:{id:post.userId}}).then().catch((err)=>{console.log(err)});

        let commentlist = await Comment.findAll({where:{postId:post.id},
            order: [['createdAt','Desc']],
        }).then().catch((err)=>{console.log(err)});
        
        let comments = commentlist.map((result)=>result.get({plain:true}));
        let newComments = [];
        let commentLength;

        for(let i = 0; i < comments.length; i++){

            let myuser = await User.findOne({raw:true,where:{id:comments[i].userId}}).then().catch((err)=>{console.log(err)});
            newComments.push({comment:comments[i],user:myuser});

            if(post.userId == myId || newComments[i].comment.userId == myId){

                newComments[i].isCreator = true;

            }else{

                newComments[i].isCreator = false;

            }
        }

        commentLength = comments.length;
        comments = newComments;

        let postuser = {post,user};

        let message = false;
        if(req.session.message){
            message = req.session.message
            delete req.session.message
        }

        req.session.principal = await PostController.getMostComments()

        const page = 'Comentarios';
        req.session.save(() => {
            res.render('pages/comment',{page,postuser,comments,commentLength,message})
        })
    }

    static async deleteComment(req,res){

        const id = req.body.id;
        const postId = req.body.postId;

        await Comment.destroy({where:{id:id}}).then( 

            req.session.message = {type:'success',text:'Mensagem apagada com sucesso!'}
            
            ).catch((err)=>{console.log(err)});

        req.session.save(() => {
            res.redirect(`/comment/${postId}`)
        })

    }
}