const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const session = require('express-session'); //para guardar la variable del usuario, hay que instalar npm install express-session


const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('./public/user');

const UserEnterprise = require('./public/userEnterprise');







app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.use(express.static(path.join(__dirname, 'public')));

const mongo_uri = 'mongodb+srv://juan:g8aGkvwPhQ2LLLse@cluster0.l5uxggj.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(mongo_uri)
  .then(() => {
    console.log(`Conectado exitosamente a ${mongo_uri}`);
  })
  .catch((err) => {
    console.error(`Error al conectar a ${mongo_uri}: ${err.message}`);
  });
/////////////////////////////////
//guardadora de variables

app.use(session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: true
  }));

///////////////***************////////////
const fs = require('fs');

const ruta = './uploads';

if (fs.existsSync(ruta)) {
  console.log(`La ruta ${ruta} existe.`);
} else {
  console.log(`La ruta ${ruta} no existe.`);
}

///////////////***************////////////

app.post('/register', (req, res)=> {
  const {name, email, password, date, phone,
     city, skills, languages, gender, studies} = req.body;


  User.findOne({ email })
  .then((user) => {
    if (user) {
      // Si el usuario ya existe, envía una alerta y no continúes con el registro
      return res.status(400).send('El correo electrónico ya está registrado');
    }

  const Newuser = new User({
    name,
    email,
    password,
    date,
    phone, 
    city,
    skills, 
    languages,
    gender,
    studies
  });

  
  Newuser.save()
    .then(() => {
      res.status(200).send('USUARIO REGISTRADO');
    })
  })
});


//-----------------------------------------------------------
//Guardar datos de la empresa

app.post('/registerEnterprise', (req, res)=> {
  const {name, email, type, phone, location, password } = req.body;

     User.findOne({ email })
     .then((user) => {
       if (user) {
         // Si el usuario ya existe, envía una alerta y no continúes con el registro
         return res.status(400).send('El correo electrónico ya está registrado');
       }
   
     const NewuserEnterprise = new UserEnterprise({
       name,
       email,
       type,
       phone, 
       location,
       password
     });
   
     
     NewuserEnterprise.save()
       .then(() => {
         res.status(200).send('USUARIO REGISTRADO');
       })
     })

  });
// Fin de guardar datos de la empresa


app.post('/authenticate', async (req, res) => {
  console.log('Se ha llamado a la ruta /authenticate');
  const { email, password } = req.body;
  req.session.email = email;
  let validation1 = true;
  let validation2 = true;

  try {
    const user = await User.findOne({ email });
    const user_enterprise = await UserEnterprise.findOne({ email });

    if (!user) {
      validation1 = false;
    } else if (!user_enterprise) {
      validation2 = false;
    }

    if (!validation1 && !validation2) {
      res.status(404).send('EL USUARIO NO EXISTE');
    } else {
      let passwordIsValid1 = false;
      let passwordIsValid2 = false;

      if (validation1) {
        passwordIsValid1 = bcrypt.compareSync(password, user.password);
      } else if (validation2) {
        passwordIsValid2 = bcrypt.compareSync(password, user_enterprise.password);
      }

      if (passwordIsValid1) {
        res.redirect('/paginaWeb.html');
      
        //res.status(200).send('USUARIO AUTENTICADO CORRECTAMENTE');
        
      } else if(passwordIsValid2){
        res.redirect('/enterprisePage.html');
      }else {
        res.status(500).send('No funcionó, inténtalo de nuevo');
      }
    }
  } catch (err) {
    res.status(500).send('ERROR AL AUTENTICAR AL USUARIO');
  }
});


///////////////////////////////////////

//PEDIR DATOS DE LA BD

app.get('/userPage', async (req, res) => {
  try {
    const emailxxx = req.session.email;
    // Consultar la base de datos y obtener los datos
    const user = await User.findOne({ email: emailxxx });
    //const userEnterprise = await UserEnterprise.findOne({ email: emailxxx });
    console.log(emailxxx)
    console.log(user.phone)
    //console.log(user.name)
    // Comprobar si se encontró un usuario
    if (user) {
      // Enviar los datos como respuesta en formato JSON
      res.json({
        name: user.name,
        email: user.email,
        date: user.date,
        phone: user.phone,
        city: user.city,
        skills: user.skills,
        languages: user.languages,
        gender: user.gender
      });
      /*
    }else if (userEnterprise){
      console.log("entre aca")
      res.json({
        name: userEnterprise.name,
        skills: userEnterprise.skills,
        email: userEnterprise.email
      });
    */
    } else {
      // Si no se encontró un usuario, enviar una respuesta con un mensaje de error
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json('Error en el servidor');
  }
});

/////////////////////////////

//Pedir datos de la BD pero de las empresas
app.get('/enterprisePage', async (req, res) => {
  try {
    const emailxxx = req.session.email;
    // Consultar la base de datos y obtener los datos
    
    const userEnterprise = await UserEnterprise.findOne({ email: emailxxx });
    //console.log(emailxxx)
    // Comprobar si se encontró un usuario
    
    if (userEnterprise){
      res.json({
        name: userEnterprise.name,
        email: userEnterprise.email,
        type: userEnterprise.type,
        phone: userEnterprise.phone,
        location: userEnterprise.location
      });
    
    } else {
      // Si no se encontró un usuario, enviar una respuesta con un mensaje de error
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json('Error en el servidor');
  }
});




 


app.listen(3000, () => 
    console.log('server started')

)

module.exports = app;