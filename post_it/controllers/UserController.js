const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Following = require('../models/Following');
const bcrypt = require('bcryptjs');

module.exports = class UserController{

    static async login(req,res){
        let user = {}
        if(req.session.infoUser){
            user.username = req.session.infoUser.username
            user.email = req.session.infoUser.email
            user.password = req.session.infoUser.password
            delete req.session.infoUser;
        }

        if(req.session.userid){
    
            res.redirect('/');
            return
        }     
    
        let message = false;
        if(req.session.message){
            message = req.session.message
            delete req.session.message
        }

        let reg_message = false;
        if(req.session.reg_message){
            reg_message = req.session.reg_message
            delete req.session.reg_message
        }

        res.render('pages/login',{message,reg_message,user});
    
    }

    static async loginUser(req,res){

        const {email,password} = req.body;
        const user = await User.findOne({raw:true,where:{email:email}})
        

        if(!user){
            req.session.message = {type:'warning',text:'Usuário não existe!'}
            req.session.save(() => {
                res.redirect('/login');
            });
            return
        }

        let isPasswordMetch = await bcrypt.compare(password,user.password);
        
        if(!isPasswordMetch){
            req.session.message = {type:'warning',text:'Senha incorreta!'}
            req.session.save(() => {
                res.redirect('/login')
            });
            return            
        }
        req.session.message = {type:'neutral',text:'Olá, bem vindo de volta!'}
        req.session.userid = user.id;

        req.session.save(()=>{
            res.redirect('/')
        })
    }

    static async registeUser(req,res){
        const {username,email,password,confirmpassword} = req.body;
   
        if(username == "" || email == "" || password == "" || confirmpassword == ""){

            req.session.reg_message = {fill_all:'Todos os campos do formulario de registro devem está preenchidos!'};
            req.session.infoUser = {username,email,password}
            req.session.save(() => {
                res.redirect('/login')
            });
            return

        }

        if(await User.findOne({where:{email:email}})){

            req.session.reg_message = {email:'O email passado já foi registrado!'};
            req.session.infoUser = {username,email,password}
            req.session.save(() => {
                res.redirect('/login')
            })
            return

        }
        if(password != confirmpassword){

            req.session.reg_message = {senha:'As senhas passadas não coencidem, por favor tente novamente!'};
            req.session.infoUser = {username,email,password}
            req.session.save(() => {
                res.redirect('/login')
            });
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
        
        req.session.message = {type:'neutral',text:'Olá, sejá bem vindo ao Post it!'}

        req.session.userid = newUser.id;

        req.session.save(() => {
            res.redirect('/');
        });
    }

    static async user(req,res){

        const id       = req.params.id;
        const user     = await User.findOne({raw:true ,where:{id:id}}).then().catch(()=>{});
        if(!user){
            const page = "Este usuário não existe!"
            res.render('pages/usernotexit',{page});
            return
        }
        const page     = user.username;
        let outherUser = true;

        if(user.id === req.session.userid){

            outherUser = false;

        }

        user.outherUser = outherUser;

        const post = await Post.findAll({where:{userId:id},

            order: [['createdAt','Desc']],
            include: [{ model: User }]

        });

        const postMaping = post.map((result)=>result.get({plain:true}));

        for(let i = 0; i < postMaping.length;i++){

            const postcomments = await Comment.findAll({raw:true,where:{postId:postMaping[i].id}});
            postMaping[i].commentLength = postcomments.length;

        }

        let following = false;
        
        if(req.session.id != id){

            following = await Following.findOne({raw:true,where:{userId: req.session.userid,followedId:id}});

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

        user.follow         = following;
        user.following      = followingLength;
        user.follower       = followerLength;

        let haspost = false;

        if(postMaping.length > 0){
            haspost = true;
        }else{
            haspost = false;
        }

        const perfil = true;

        let message = false;
        if(req.session.message){
            message = req.session.message
            delete req.session.message
        }
        req.session.save(() => {
            res.render('pages/user',{page,user,postMaping,haspost,perfil,message})
        })
    }

    static async settings(req,res){

        const id = req.session.userid;
       
        const user = await User.findOne({raw:true,where:{id:id}});
        const page = "Configurações de usuário";
        const setting = true;

        let message = false;
        if(req.session.message){
            message = req.session.message
            delete req.session.message
        }

        req.session.save(() => {
            res.render('pages/usersettings',{user,page,setting,message})
        })        
    }

    static async sattingsSave(req,res){

        delete req.session.message;

        const {username,description} = req.body;
        
        const id = req.session.userid;

        const user={

            username,
            description

        }
        
        if(username != ""){

            req.session.message = {type:'success',text:'Informações de usuário atualizadas com sucesso!'}
            await User.update(user,{where:{id:id}});
            
        }else{

            req.session.message = {type:'warning',text:'Mensagem apagada com sucesso!'}

        }
        req.session.save(() => {
            res.redirect('/settings')
        })
 
    }

    static async quit(req,res){

        req.session.destroy(function(err){

            if(err){

                console.log(err);

            }else{
                    res.redirect('/login')
            }
        });
    }
}