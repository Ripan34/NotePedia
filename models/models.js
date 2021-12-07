const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const universitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    classes: [{type: mongoose.Schema.Types.ObjectId, ref: 'Class'}]
});

const classSchema = new mongoose.Schema({
    name: String,
    notes: [{type: mongoose.Schema.Types.ObjectId, ref: 'Note'}]
})
const notesSchema = new mongoose.Schema({
        title: String,
        subject: String,
        content: String,
        postedBy: String,
        datePosted: Date
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name cannot be blank"]
    },
    password: {
        type: String,
        required: [true, "password cannot be blank"]
    },
    email: {
        type: String,
        required: [true, "email cannot be blank"]
    },
    school: {
        type: String,
        required: [true, "school cannot be blank"]
    },
    isTeacher: {
        type: Boolean,
        required: [true, "isTeacher cannot be blank"]
    },
    notes: [{type: mongoose.Schema.Types.ObjectId, ref: 'Note'}]
})

userSchema.statics.findAndValidate = async function(email, password){
    const foundUser = await this.findOne({email});
    if(!foundUser)
        return false;
    const isValid = await bcrypt.compare(password, foundUser.password);
    return isValid ? foundUser: false;
}

const Note = mongoose.model('Note', notesSchema);
const Class = mongoose.model('Class', classSchema);
const University = mongoose.model('University', universitySchema);
const User = mongoose.model('User', userSchema);

module.exports = {
    University,
    Class,
    Note,
    User
}