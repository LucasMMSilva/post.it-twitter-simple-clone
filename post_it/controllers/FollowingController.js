const Following = require('../models/Following');
const User = require('../models/User');
const {Op} = require('sequelize');
module.exports = class FollowingController{

    static async follow(req,res){
        const followedId = req.body.id;
        const thisPage = req.body.page;
        const userId = req.session.userid;
 

        let following = {
            userId: userId,
            followedId: followedId
        }

        //await Following.create(following);

        console.log('::',thisPage)

        if(thisPage == 'user'){

            console.log('user')
            res.redirect(`/user/${followedId}`)

        }else if(thisPage == 'Seguindo'){

            console.log('Seguindo')
            this.following(req,res);


        }else if(thisPage == 'Seguidores'){

            console.log('Seguidores')
            this.follower(req,res)

        }else{

            console.log('Caiu fora!')
            res.redirect(`/user/${followedId}`)

        }
    }

    static async following(req,res){
        const myId   = req.session.userid;
        const userId = req.body.id;
    
        const dirtyFollowing = await Following.findAll(
            { where: {userId:userId} }
        )
        const myfollowers = await Following.findAll(
            { where: { userId: myId } }
        )
        
        const followingMap = dirtyFollowing.map((result)=>result.get({plain:true}))
        const myfollowersMap = myfollowers.map((result)=>result.get({plain:true}))

        let users = [];
        
        for(let i = 0; i < followingMap.length;i++){
            users.push({id:followingMap[i].followedId})
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
                userMap[i].outherUser = false
            }
        }
        const page = 'Seguindo';

        for( let i = 0 ; i < userMap.length ; i++){
            userMap[i].userId = userId
            userMap[i].page = page
        }
       
        res.render('pages/follow',{userMap,userId,page})
    }
    static async follower(req,res){
        const myId   = req.session.userid;
        const userId = req.body.id;

        const dirtyFollower = await Following.findAll(
            { where: { followedId: userId } }
        )
        const myfollowers = await Following.findAll(
            { where: { userId: myId } }
        )
        const followerMap = dirtyFollower.map((result)=>result.get({plain:true}))
        const myfollowersMap = myfollowers.map((result)=>result.get({plain:true}))

        let users = [];

        for( let i = 0; i < followerMap.length ; i++ ){
            users.push({id:followerMap[i].userId})
        }
        
        const durtyUser = await User.findAll({where:{[Op.or]:users}})
        const userMap = durtyUser.map((result)=>result.get({plain:true}))
        
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
        
        res.render('pages/follow',{page,userMap,userId})
    }
}