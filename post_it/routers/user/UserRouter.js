const express = require('express');
const router = express.Router();
const UserController = require('../../controllers/UserController');
const PostController = require('../../controllers/PostController');
const CommentController = require('../../controllers/CommentController');
const FollowingController = require('../../controllers/FollowingController');
const checkAuth = require('../../helpers/auth').checkAuth;

// USER
    // GET
    router.get('/user/:id',checkAuth,UserController.user);
    router.get('/quit',checkAuth,UserController.quit);
    router.get('/settings',checkAuth,UserController.settings);
    // POST
    router.post('/login',UserController.loginUser);
    router.post('/register',UserController.registeUser);
    router.post('/settings',UserController.sattingsSave);

//POST
    // GET
    router.get('/',checkAuth,PostController.showhome);
    router.get('/create-new-post',checkAuth,PostController.showcreatepost);
    router.get('/explore',checkAuth,PostController.explore);    
    // POST
    router.post('/savecreatepost',checkAuth,PostController.saveCreatePost);

//Comment
    // GET
    router.get('/comment/:id',checkAuth,CommentController.comments);
    // POST
    router.post('/comment',checkAuth,CommentController.createComment)    


//Follower|Following
    //GET
    
    // POST
    router.post('/following',checkAuth,FollowingController.following);
    router.post('/follower',checkAuth,FollowingController.follower);
    router.post('/auth/follow',checkAuth,FollowingController.follow);

module.exports = router;