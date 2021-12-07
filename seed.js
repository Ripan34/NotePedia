const models = require("./models/universities");
const University = models.University;
const Class = models.Class;
const Note = models.Note;

//connect MongoDB
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/notePedia')
.then(() => {
    console.log("Mongo DB connection opened");
})
.catch(err => {
    console.log("Error connecting Mongo DB")
});

// Note.insertMany([
//     {
//         title: "Polymorphism",
//         subject: "Computer Science",
//         content: "CS122 Notes",
//         postedBy: "Ripan",
//     }
// ])
// .then(p => {
//     console.log(p)
// })
// .catch(err => {
//     console.log("Error Saving");
// });

// University.insertMany([
//     {
//             name: "San Jose State University",
//     }
// ])
// .then(p => {
//     console.log(p)
// })
// .catch(err => {
//     console.log("Error Saving");
// });

// Class.insertMany([
//     {
//         name: "CS122"
//     }
// ])
// .then(p => {
//     console.log(p)
// })
// .catch(err => {
//     console.log("Error Saving");
// });

const add = async () => {
const cls = await Class.findOne({name: "CS122"});
const note = await Note.findOne({title: "Polymorphism"});
const uni = await University.findOne({name: "San Jose State University"});
// cls.notes.push(note);
// await cls.save();

uni.classes.push(cls);
await uni.save();

}
add();


