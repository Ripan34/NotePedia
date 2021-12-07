const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

module.exports = mongoose.model('User', userSchema);