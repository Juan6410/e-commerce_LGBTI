const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); //con esto se encripta la password

const saltRounds = 10; //lo vamos a usar para decirle a la funcion el numero de veces que queremos encriptar

const UserSchema = new mongoose.Schema({
    name: { type: String, required:true},
    email: { type: String, required:true, unique: true},
    password: { type: String, required: true},
    date: {type: String, require: true},
    phone: {type: String, requiere: true},
    city: {type: String, requiere: true},
    skills: {type: String, requiere: true},
    languages: {type: String, requiere: true},
    gender: {type: String, requiere: true },
    studies: {type: String, requiere: true}


});



UserSchema.pre('save', function(next){ //antes que se guarden los datos se ejecuta una funcion
    if(this.isNew || this.isModified('password')){

        const document = this;

        bcrypt.hash(document.password, saltRounds, (err, hashedPassword) => {
            if(err){
                next(err);
            
            }else{
                document.password = hashedPassword;
                next();
            }
        });
    }else{
        next();
    }
});



module.exports = mongoose.model('Users', UserSchema);
