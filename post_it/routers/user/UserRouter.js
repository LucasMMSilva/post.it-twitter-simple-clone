const express = require('express');
const router = express.Router();
const UserController = require('../../controllers/UserController');
const PostController = require('../../controllers/PostController');
const CommentController = require('../../controllers/CommentController');
const FollowingController = require('../../controllers/FollowingController');
const checkAuth = require('../../helpers/auth').checkAuth;

// USER
    // GET
    router.get('/login',UserController.login);
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
    router.get('/search',checkAuth,PostController.search);    
    router.get('/search/user/:search',checkAuth,PostController.searchUser);    
    router.get('/search/content/:search',checkAuth,PostController.searchContent); 
    // POST
    router.post('/savecreatepost',checkAuth,PostController.saveCreatePost);
    router.post('/edit',checkAuth,PostController.editPost);
    router.post('/saveedit',checkAuth,PostController.saveEditPost);
    router.post('/delete',checkAuth,PostController.deletePost);

//Comment
    // GET
    router.get('/comment/:id',checkAuth,CommentController.comments);
    // POST
    router.post('/comment',checkAuth,CommentController.createComment)    
    router.post('/deletecomment',checkAuth,CommentController.deleteComment)

//Follower|Following
    //GET
    router.get('/user/:id/following',checkAuth,FollowingController.following);
    router.get('/user/:id/follower',checkAuth,FollowingController.follower);
    // POST
    router.post('/auth/follow',checkAuth,FollowingController.follow);
    router.post('/auth/unfollow',checkAuth,FollowingController.unfollow);

module.exports = router;