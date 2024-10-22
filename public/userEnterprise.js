const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); //con esto se encripta la password

const saltRounds = 10; //lo vamos a usar para decirle a la funcion el numero de veces que queremos encriptar

const UserSchema2 = new mongoose.Schema({
    name: { type: String, required:true},
    email: { type: String, required:true, unique: true},
    type: { type: String, required:true},
    phone: {type: String, required: true},
    location: { type: String, required: true},
    password: { type: String, required: true}
     
});

UserSchema2.pre('save', function(next){ //antes que se guarden los datos se ejecuta una funcion
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

module.exports = mongoose.model('UsersEnterprise', UserSchema2);