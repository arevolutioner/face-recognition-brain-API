const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex')
const register = require('./controllers/register')

const db = knex({
    client: 'pg',
    connection: {
        connectionString : process.env.DATABASE_URL,
        ssl:true,
    }

});

db.select('*').from('users').then(data => {
    console.log(data);
});


const app = express();



app.use(bodyParser.json())
app.use(cors())


app.get('/', (req, res) => {
    res.send('it is working');

})



app.post('/signin', (req, res) => {
    const { email, password} =req.body;
    if (!email || !password){
        return res.status(400).json('incorect form submission');
    }
    db.select('email', 'hash').from('login')
    .where('email', '=', email)
    .then(data=>{
        const isValid = bcrypt.compareSync(password, data[0].hash);
        if (isValid){
            return db.select('*')
            .from('users')
            .where('email', '=', email)
            .then(user => {
                res.json(user[0])
            })
            .catch(err => res.status(400).json('unable to get user'))
        } else {
            res.status(400).json('wrong credentials')
        }
    })
    .catch(err=> res.status(400).json('wrong credentials'))
  
})

app.post('/register', (req,res) => {register.handleRegister(req, res, db, bcrypt)})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    let found = false;
    db.select('*').from('users').where({ id }) // id: id
    .then(user => {
        if(user.length){
            res.json(user[0])
        } else {
            res.status(400).json('Not Found')
        }
        
    })
    .catch(err => {
        res.status(400).json('error getting user')
        
    })  
})

app.put('/image', (req, res) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0]);
    })
    .catch(err => res.status(400).json('unable to get entries'))
    
})



app.listen(process.env.PORT || 3000, ()=> {
    console.log(`app is running on port ${process.env.PORT}`)

})

/*
1. --> res = this is working
2. /signin --> POST = success/fail
3. /register --> POST = user
4. /profile/:userId --> GET = user
5. /image --> PUT -->(return) user



*/
