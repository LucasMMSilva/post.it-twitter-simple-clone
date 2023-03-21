const Post     = require('../models/Post');
const User     = require('../models/User');
const Comment  = require('../models/Comment');
const Following  = require('../models/Following');
const {Op}     = require('sequelize');
module.exports = class PostController{

    static async showcreatepost(req,res){

        let message = false;
        if(req.session.message){
            message = req.session.message
            delete req.session.message
        }
        req.session.save(() => {
            res.render('pages/createpost',message)
        })
    }

    static async saveCreatePost(req,res){
        
        const {title,content} = req.body;

        if(title != "" && content != ""){

            const post = {

                title,
                content,
                userId:req.session.userid

            }

            await Post.create(post).then(
                
            ).catch((err)=>{console.log(err)});
            
            req.session.message = {type:'success',text:'Postagem criada com sucesso!'}
            
            req.session.save(() => {
                res.redirect('/')
            })
            
        }else{           

            req.session.message = {type:'warning',text:'Todos os campos devem está preenchidos para proceguir!'}

            req.session.save(() => {
                res.redirect('/create-new-post')
            })   
        }
    }

    static async showhome(req,res){

        const page = 'Pagina Inicial';
        const userId = req.session.userid;

        let following = await Following.findAll({where:{userId:userId},attributes: ['followedId']}).then().catch((err)=>{console.log(err)});

        const followingmap = following.map((result)=>result.get({plain:true}));
        const followings = followingmap.map((result)=>{

            return{ userId: result.followedId }

        });

        followings.push({userId: userId})

        const post = await Post.findAll({where:{

            [Op.or]:followings

        },

            order: [['createdAt','Desc']],
            include: [{ model: User }]

        }).then().catch((err)=>{console.log(err)});

        const postMaping = post.map((result)=>result.get({plain:true}));

        for(let i = 0; i < postMaping.length;i++){

            const postcomments = await Comment.findAll({raw:true,where:{postId:postMaping[i].id}}).then().catch((err)=>{console.log(err)});

            if(postMaping[i].userId == userId){

                postMaping[i].creator = true;

            }else{

                postMaping[i].creator = false;

            }

            postMaping[i].commentLength = postcomments.length;
        }

        let haspost

        if(postMaping.length > 0){

            haspost = true;

        }else{

            haspost = false;

        }

        let message = false;
        if(req.session.message){
            message = req.session.message
            delete req.session.message
        }
        const home = true

        
        req.session.principal = await PostController.getMostComments()

 
        req.session.save(() => {
            res.render('pages/home',{page,postMaping,haspost,home,message});
        })
    }

    static async getMostComments(){

        const durtycomment = await Comment.findAll({})
        const comments = durtycomment.map((result)=>result.get({plain:true}))

        let mostcomment = []

        for(let i = 0 ; i<comments.length ; i++){
            const hasObj = Object.values(mostcomment).some(item => item.postId === comments[i].postId)
            
            if(hasObj){
                let y;
                for(let j = 0 ; j < mostcomment.length ; j++){

                    if(mostcomment[j].postId == comments[i].postId){
                        y = j
                        break
                    }
                }
  
                mostcomment[y].qlyComment = mostcomment[y].qlyComment+1
            }else{
                mostcomment.push({postId : comments[i].postId, qlyComment : 1});
            }
        }

        mostcomment.sort((a, b) => b.qlyComment - a.qlyComment);
        console.log(mostcomment)

        let postIds = []
        for(let i = 0 ; i < mostcomment.length ; i++){
            postIds.push({id : mostcomment[i].postId})
        }

        const durtyPosts = await Post.findAll({where:{
            [Op.or]:postIds
        }})
        const principalposts = durtyPosts.map((result)=>result.get({plain:true}))

        let principal = []

        for(let i = 0 ; i < principalposts.length ; i++){
            principal.push({id: principalposts[i].id,title: principalposts[i].title})
        }
        let principalsInOrder = []
        for(let i = 0;i<mostcomment.length;i++){
            for(let j = 0;j<mostcomment.length;j++){
                if(mostcomment[i].postId == principal[j].id){
                    principalsInOrder.push({id:principal[j].id,title:principal[j].title,quantity:mostcomment[i].qlyComment})
                    break
                }
            }
            if(principalsInOrder.length >= 8){
                break
            }
            
        }
        return principalsInOrder
    }


    static async explore(req,res){

        const userId = req.session.userid;

        const page = 'Explorar';

        const post = await Post.findAll({

            order: [['createdAt','Desc']],
            include: [{ model: User }],
            limit:20

        }).then().catch((err)=>{console.log(err)});

        const postMaping = post.map((result)=>result.get({plain:true}));



        for(let i = 0; i < postMaping.length;i++){

            const postcomments = await Comment.findAll({raw:true,where:{postId:postMaping[i].id}})
            postMaping[i].commentLength = postcomments.length

            if(postMaping[i].userId == userId){

                postMaping[i].creator = true;

            }else{

                postMaping[i].creator = false;

            }

        }

        let haspost

        if(postMaping.length > 0){

            haspost = true;

        }else{

            haspost = false;

        }

        const explore = true

        let message = false;
        if(req.session.message){
            message = req.session.message
            delete req.session.message
        }
        req.session.save(() => {
            res.render('pages/explore',{page,postMaping,haspost,explore,message})
        })
    }

    static async search(req,res){
        const userId = req.session.userid;
        const search = req.query.search;

        const dirtyUsers = await User.findAll({

            where:{username:{[Op.like]: `%${search}%`}},
            limit:3

        }).then().catch((err)=>{console.log(err)});

        const dirtyPosts = await Post.findAll({

            where:{ title:{[Op.like]: `%${search}%`} },
            include:{ model:User }

        }).then().catch((err)=>{console.log(err)});

        const userMap = dirtyUsers.map((result)=>result.get({plain:true}))
        const postsMap = dirtyPosts.map((result)=>result.get({plain:true}))

        const myfollowers    = await Following.findAll({ where: { userId: userId } });
        const myfollowersMap = myfollowers.map((result)=>result.get({plain:true}));

        let hasusers = false;

        if( userMap.length>0){

            hasusers = true;

        }

        let hasposts = false;

        if( postsMap.length>0){

            hasposts = true;

        }

        for(let i = 0 ; i < postsMap.length ; i++){

            const comment = await Comment.findAll({raw:true,where:{postId:postsMap[i].id}}).then().catch((err)=>{console.log(err)});
            postsMap[i].commentLength = comment.length

            if(postsMap[i].userId == userId){

                postsMap[i].creator = true;

            }else{

                postsMap[i].creator = false;

            }

        }
        for( let i = 0 ; i < userMap.length ; i++ ){
            
            if(userMap[i].id != userId){

                userMap[i].outherUser = true;

                for( let j = 0 ; j < myfollowersMap.length ; j++ ){

                    if(myfollowersMap[j].followedId == userMap[i].id){

                        userMap[i].follow = true;
                        break;

                    }else{

                        userMap[i].follow = false;

                    }
                }
            }else{

                userMap[i].outherUser = false;

            }
            userMap[i].search = search;
        }
        

        let hascontent = false;
        
        if(hasusers != false || hasposts != false){

            hascontent = true;

        }

        const page = `Buscando por: ${search}`;

        let message = false;
        if(req.session.message){
            message = req.session.message
            delete req.session.message
        }
        req.session.save(() => {
            res.render('pages/search',{page,userMap,postsMap,hascontent,hasusers,hasposts,search,message});
        })
    }

    static async searchUser(req,res){

        const search = req.params.search;

        const dirtyUsers = await User.findAll({

            where:{ username:{[Op.like]: `%${search}%`} }

        }).then().catch((err)=>{console.log(err)});

        const usersMap = dirtyUsers.map((result)=>result.get({plain:true}))

        let hascontent = false

        if( usersMap.length>0){

            hascontent = true

        }

        const page = `Buscando por: ${search}`;      
        const warning = `Infelizmente não encontramos nenhum usuario como o username relacionado a ${search}!`;
        let message = false;
        if(req.session.message){
            message = req.session.message
            delete req.session.message
        }
        req.session.save(() => {
            res.render('pages/search',{usersMap,hascontent,page,search,warning,message})
        })
    }

    static async searchContent(req,res){

        const userId = req.session.userid
        const search = req.params.search;

        const dirtyPosts = await Post.findAll({

            where:{ title:{[Op.like]: `%${search}%` }},
            include:{ model:User }

        }).then().catch((err)=>{console.log(err)})

        const postsMap = dirtyPosts.map((result)=>result.get({plain:true}));

        let hascontent = false;

        if( postsMap.length>0){

            hascontent = true;

        }

        for(let i = 0 ; i < postsMap.length ; i++){

            const comment = await Comment.findAll({raw:true,where:{postId:postsMap[i].id}}).then().catch((err)=>{console.log(err)});
            postsMap[i].commentLength = comment.length;

            if(postsMap[i].userId == userId){

                postsMap[i].creator = true;

            }else{

                postsMap[i].creator = false;

            }

        }

        const page = `Buscando por: ${search}`;
        const warning = `Infelizmente não encontramos nenhum conteúdo relacionado a ${search}!`;

        let message = false;
        if(req.session.message){
            message = req.session.message
            delete req.session.message
        }
        
        req.session.save(() => {
            res.render('pages/search',{postsMap,hascontent,page,search,warning,message})
        });
    }

    static async editPost(req,res){

        const id = req.body.id;

        const post = await Post.findOne({raw:true,where:{id:id}}).then().catch((err)=>{console.log(err)});

        let message = false;
        if(req.session.message){
            message = req.session.message
            delete req.session.message
        }

        req.session.save(() => {
            res.render('pages/editpost',{post,message})
        });
    }

    static async saveEditPost(req,res){

        const {id,title,content} = req.body;

        if(title == "" || content == ""){

            req.session.message = {type:'warning',text:'Para salvar as atualizações de usa postagem mantenha todos os campos preenchidos!'}

        }else{
            
            const post = {

                id,
                title,
                content

            }

            await Post.update(post,{where:{id:id}}).then(
                req.session.message = {type:'success',text:'Informações atualizados com sucesso!'}
            ).catch((err)=>{console.log(err)});
            
        }
        req.session.save(() => {
            res.redirect(`/comment/${id}`)
        });
    }

    static async deletePost(req,res){
        
        const id = req.body.id;

        await Post.destroy({where:{id:id}}).then( 
            req.session.message = {type:'success',text:'A postagem foi apagada com sucesso!'}
        ).catch((err)=>{console.log(err)});

        req.session.save(() => {    
            res.redirect('/')
        });
    }
}
