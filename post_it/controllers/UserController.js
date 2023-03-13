const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Following = require('../models/Following');
const bcrypt = require('bcryptjs');

module.exports = class UserController{

    static async loginUser(req,res){

        const {email,password} = req.body;
        const user = await User.findOne({raw:true,where:{email:email}})

        if(!user){
            res.redirect('/login');
            
            return
        }
        let isPasswordMetch = await bcrypt.compare(password,user.password);
        if(!isPasswordMetch){
            res.redirect('/login');
            return
        }

        req.session.userid = user.id;

        req.session.save(()=>{
            res.redirect('/')
        })
    }

    static async registeUser(req,res){
        const {username,email,password,confirmpassword} = req.body;
    
        if(await User.findOne({where:{email:email}})){
            res.redirect('/login')
            return
        }
        if(password != confirmpassword){
            res.redirect('/login')
            return
        }
        const salt = bcrypt.genSaltSync(10);
        const cryptPassword = bcrypt.hashSync(password,salt)
        
        const user = {
            username,
            email,
            password : cryptPassword
        }

        const newUser = await User.create(user);
        
        req.session.userid = newUser.id;
        
        req.session.save(() => {
            res.redirect('/');
        });
    }

    static async user(req,res){

        const id = req.params.id;
        const user = await User.findOne({raw:true ,where:{id:id}});
        const page = user.username;
        let outherUser = true;
        if(user.id === req.session.userid){
            outherUser = false;
        }
        user.outherUser = outherUser
        const post = await Post.findAll({where:{userId:id},
            order: [['createdAt','Desc']],
            include: [{
                model: User
            }]
        })
        const postMaping = post.map((result)=>result.get({plain:true}))

        for(let i = 0; i < postMaping.length;i++){
            const postcomments = await Comment.findAll({raw:true,where:{postId:postMaping[i].id}})
            postMaping[i].commentLength = postcomments.length
        }

        let following = false;
        
        if(req.session.id != id){
            following = await Following.findOne({raw:true,where:{userId: req.session.userid,followedId:id}})
            if(following!=null && following!=undefined){
                following = true
            }else{
                following = false
            }
        }

        const followingList = await Following.findAll({where:{userId: id}})
        const followerList  = await Following.findAll({where:{followedId: id}})

        const followingMap  = followingList.map((result)=>result.get({plain:true}))
        const followerMap   = followerList.map((result)=>result.get({plain:true}))

        let followingLength = followingMap.length != null ? followingMap.length : 0;
        let followerLength  = followerMap.length != null ? followerMap.length : 0;

        user.follow    = following;
        user.following = followingLength;
        user.follower  = followerLength;

        let haspost
        if(postMaping.length > 0){
            haspost = true;
        }else{
            haspost = false;
        }

        res.render('pages/user',{page,user,postMaping,haspost});
    }

    static async settings(req,res){
        const id = req.session.userid
        const user = await User.findOne({raw:true,where:{id:id}})
        const page = "Configurações de usuário"
        res.render('pages/usersettings',{user,page})
    }

    static async sattingsSave(req,res){
        const {username,description} = req.body;
        const id = req.session.userid;
        const user={
            username,
            description
        }
        await User.update(user,{where:{id:id}})
        req.flash('message','Informações Atualizadas com sucesso!')
        res.redirect('/settings')
    }

    static async quit(req,res){
        req.session.destroy(function(err){
            if(err){
                console.log(err)
            }else{
                res.redirect('/login')
            }
        })
    }

}