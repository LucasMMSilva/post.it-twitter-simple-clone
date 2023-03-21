const express        = require('express');
const exphbs         = require('express-handlebars');
const session        = require('express-session');
const FileStore      = require('session-file-store')(session);
const conn           = require('./db/conn');
const userRouter     = require('./routers/user/UserRouter');

const app            = express();


app.engine('handlebars',exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views','./views');

app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(session({

    name: 'session',
    secret: 'my_secret',
    resave: false,
    saveUninitialized: true,
    store: new FileStore({
        logFn: function(){},
        path: require('path').join(require('os').tmpdir(),'session')
    }),
    cookie: {
        secure: false,
        maxAge: 86400000,
        expires: new Date(Date.now()+86400000),
        httpOnly: true
    }

}));


app.use((req,res,next)=>{

    if(req.session.userid){

        res.locals.session = req.session;

    }

    next();

});

app.use('/',userRouter);

app.use(function(req,res,next){
    const page = 'Está página não existe!'
    res.status(404).render('pages/err404',{page})
    
})
conn.sync(/*{force:true}*/)
.then(
    app.listen(3000)
).catch((err)=>{
    console.log(err)
})
