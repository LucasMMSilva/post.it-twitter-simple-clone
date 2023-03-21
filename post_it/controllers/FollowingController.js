const Following = require('../models/Following');
const User = require('../models/User');
const {Op} = require('sequelize');
module.exports = class FollowingController{

    static async unfollow(req,res){

        const search     = req.body.search;
        const followedId = req.body.id;
        const thisPage   = req.body.page;
        const userId     = req.session.userid;
        const followpage = req.body.followpage;

        await Following.destroy({where:{userId:userId,followedId:followedId}}).then().catch((err)=>{console.log(err)});

        if(thisPage == 'user'){

            res.redirect(`/user/${followedId}`)
            
        }else if(thisPage == 'Seguindo'){

            res.redirect(`/user/${followpage}/following`)

        }else if(thisPage == 'Seguidores'){

            res.redirect(`/user/${followpage}/follower`)

        }else if(search){

            res.redirect(`/search?search=${search}`)
    
        }
    }

    static async follow(req,res){

        const search     = req.body.search;
        const followedId = req.body.id;
        const thisPage   = req.body.page;
        const userId     = req.session.userid;
        const followpage = req.body.followpage;
 

        let following = {

            userId: userId,
            followedId: followedId

        }

        await Following.create(following);

        if(thisPage == 'user'){

            res.redirect(`/user/${followedId}`)

        }else if(thisPage == 'Seguindo'){

            res.redirect(`/user/${followpage}/following`)

        }else if(thisPage == 'Seguidores'){

            res.redirect(`/user/${followpage}/follower`)

        }else if(search){

            res.redirect(`/search?search=${search}`)

        }
    }
    
    static async following(req,res){

        const userId = req.params.id;
        let myId   = req.session.userid;
       
        const dirtyFollowing = await Following.findAll({ where: {userId:userId} });
        const myfollowers    = await Following.findAll({ where: { userId: myId } });
        
        const followingMap   = dirtyFollowing.map((result)=>result.get({plain:true}));
        const myfollowersMap = myfollowers.map((result)=>result.get({plain:true}));

        let users = [];
        
        for(let i = 0; i < followingMap.length;i++){

            users.push({id:followingMap[i].followedId});

        }

        const durtyUser = await User.findAll({where:{[Op.or]:users}})

        const userMap = durtyUser.map((result)=>result.get({plain:true}))

        for( let i = 0 ; i < userMap.length ; i++ ){

            if(userMap[i].id != myId){

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
        }

        const page = 'Seguindo';

        for( let i = 0 ; i < userMap.length ; i++){

            userMap[i].userId = userId;
            userMap[i].page = page;

        }

        const perfil = true;

        res.render('pages/follow',{userMap,userId,page,perfil})
    }

    static async follower(req,res){

        const myId   = req.session.userid;
        const userId = req.params.id;

        const dirtyFollower = await Following.findAll({ where: { followedId: userId } });
        const myfollowers   = await Following.findAll({ where: { userId: myId } });

        const followerMap   = dirtyFollower.map((result)=>result.get({plain:true}));
        const myfollowersMap = myfollowers.map((result)=>result.get({plain:true}));

        let users = [];

        for( let i = 0; i < followerMap.length ; i++ ){

            users.push({id:followerMap[i].userId});

        }
        
        const durtyUser = await User.findAll({where:{[Op.or]:users}})

        const userMap   = durtyUser.map((result)=>result.get({plain:true}))
        
        for( let i = 0 ; i < userMap.length ; i++ ){

                if(userMap[i].id != myId){

                    userMap[i].outherUser = true;
                    
                    for( let j = 0 ; j < myfollowersMap.length ; j++ ){

                        if(myfollowersMap[j].followedId == userMap[i].id){

                            userMap[i].follow = true
                            break

                        }else{

                            userMap[i].follow = false;

                        }

                    }        

                }else{

                    userMap[i].outherUser = false

                }       
        }   
        const page = 'Seguidores'

        for( let i = 0 ; i < userMap.length ; i++){

            userMap[i].userId = userId
            userMap[i].page = page

        }

        const perfil = true
        
        res.render('pages/follow',{page,userMap,userId,perfil})
    }
}