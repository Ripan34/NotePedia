const express = require('express');
const app = express();
const path = require('path');
const session = require("express-session");
const models = require("./models/models");
const bcrypt = require('bcrypt');
const University = models.University;
const Class = models.Class;
const Note = models.Note;
const User = models.User;

//to serve static files
app.use(express.static('public'));

//to parse body for post request
app.use(express.urlencoded({ extended: true }));
var sess = {
    secret: 'keyboard cat',
    resave: false, 
    saveUninitialized: false,
    cookie: {}
  }
  
  if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
  }

app.use(session(sess));

app.set('view engine', 'ejs'); //setting ejs for templating
app.set('views', path.join(__dirname + '/views')); 

//connect MongoDB
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/notePedia')
.then(() => {
    console.log("Mongo DB connection opened");
})
.catch(err => {
    console.log("Error connecting Mongo DB")
});

//route for home page
app.get('/', (req, res) => {
    res.render('landing');
})
//route for create note page
app.get('/new', (req, res) => {
    if(!req.session.user_id){
        res.redirect('signIn');
    }
    else
        res.render('createNote');
})

//route for viewing notes
app.get('/notes', async (req, res) => {

    const universities = await University.find({});
    res.render('browseCategory', {universities});
    
})

//To post new Note
app.post('/notes', async (req, res) => {
const {subject, title, className, content} = req.body;
const uid = req.session.user_id;
const user = await User.findOne({_id: uid});
const uniName = user.school;
const userName = user.name;

await Note.create({
    title: title,
    subject: subject,
    content: content,
    postedBy: userName,
})
.then(async (nt) => {
    user.notes.push(nt);
    await user.save();
})
const newNote = await Note.findOne({title: title});
const uni = await University.findOne({name: uniName});
if(!uni){
    University.create({name: uniName})
    .then(async (u) => {
        await Class.create({
            name: className
        })
        .then(async (c) => {
            c.notes.push(newNote);
            await c.save();
            u.classes.push(c);
            u.save();
        })
    })
}
else{
    const cls = await Class.findOne({name: className});
    if(!cls){
        await Class.create({
            name: className
        })
        .then(async (c) => {
            c.notes.push(newNote);
            await c.save();
            uni.classes.push(c);
            uni.save();
        })
    }
    else{
        cls.notes.push(newNote);
        cls.save();
    }
}
res.redirect('/notes');
})

//route for classes 
app.get('/notes/:id', async (req, res, next) => {
    try{
        const {id} = req.params;
        const uni = await University.findById(id).populate('classes');
        const classes = uni.classes;
        res.render('universityClasses', {classes});
    }
    catch(e){
        next(e);
    }
})
//route for notes list
app.get('/noteslist/:id', async (req, res, next) => {
    try{
        const {id} = req.params;
        const cls = await Class.findOne({_id: id}).populate('notes');
        const notes = cls.notes;
        res.render('notesList', {notes});
        }
    catch(e){
        next(e);
    }
})
//notes detail
app.get('/notesdetail/:id', async (req, res, next) => {
    try{
    const {id} = req.params;
    const note = await Note.findOne({_id: id});
    res.render('viewDetail', {note});
}
catch(e){
    next(e);
}

})
//route for signIn
app.get('/signIn', (req, res) => {
    res.render('signIn');
    })

//route for signin POST
app.post('/signin', async (req, res, next) => {
    const{email, password} = req.body;
    try{
        const foundUser = await User.findAndValidate(email, password);
        if(!foundUser){
            res.send("wrong username or password");
        }
        else{
            req.session.user_id = foundUser._id;
            res.redirect("/profile");
        }
    }
    catch(e){
        next(e);
    }
})
//route for signUp
app.get('/signUp', (req, res) => {
    res.render('signUp');
    })

//route for signUp POST
app.post('/signup', async (req, res, next) => {
    let isTeacher = true;
    const {category} = req.body;
    if (category == "student"){
        isTeacher = false;
    }
    const {name, email, school, password} = req.body;
    fixedSchool = school.toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
    fixedSchool = fixedSchool.trim();
    const hash = await bcrypt.hash(password, 12);
    try{
        const user = new User({
            name: name,
            password: hash,
            email: email,
            school: fixedSchool,
            isTeacher: isTeacher
        })
        await user.save();
        req.session.user_id = user._id;
        res.redirect("/profile")
    }
    catch (e){
        next(e);
    }
   // res.render('signUp');
    })

//to logout
app.post('/logout', (req, res) => {
    req.session.user_id = null;
    res.redirect("/");
})
//route for profile page
app.get('/profile', async (req, res) => {
    if(!req.session.user_id){
        res.redirect('signIn');
    }
    else{
        const uid = req.session.user_id;
        const user = await User.findOne({_id: uid});
        if(user.isTeacher == true){
            res.render('profilePageTeacher', {user});
            return
        }
        res.render('profilePage', {user});
    }
})

//route for my notes
app.get('/myNotes/:id', async (req, res) => {
    if(!req.session.user_id){
        res.redirect('signIn');
    }
    else{
        const uid = req.session.user_id;
        const user = await User.findOne({_id: uid}).populate('notes');
        const notes = user.notes;
        res.render('notesList', {notes});
    }

})
//questions
app.get('/questions',(req, res) => {
    if(!req.session.user_id){
        res.redirect('signIn');
    }
    else
     res.render('questions')
})
//about us
app.get('/aboutus', (req, res) => {
    res.render('aboutus')
})
//search
app.post("/search", async(req, res) => {
    let {query} = req.body;
    query = query.toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
    query = query.trim();
    const universities = await University.find({name: query});
    res.render('browseCategory', {universities});

})
//when nothing matches route
app.get('/*', (req, res) => {
    res.render('pageNotFound');
})
//error handler
app.use((err, req, res, next) => {
    const {status = 500, message = "something went wrong"} = err;
    res.status(status).send(message);
})
//listener
app.listen(3000, () => {
    console.log("LISTENING on port 3000");
})
