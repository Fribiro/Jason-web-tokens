
require('dotenv/config');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { verify } = require('jsonwebtoken');
const { hash, compare } = require('bcryptjs');
const {
     createAccessToken, 
     createRefreshToken,
     sendAccessToken,
     sendRefreshToken,
    
    } = require('./tokens.js')

const {fakeDB} = require('./fakeDB')

//Register a user
//Login a user
//Logout a user
//Setup a protected route
//Get a new accesstoken with a refresh token

const server = express();

//express middleware for easier cookie handling
server.use(cookieParser());

//setup cors
server.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true,
    })
);

//needed to read body data
server.use(express.json());//to support json-encoded bodies
server.use(express.urlencoded({ extended: true }));//support urlencoded bodies 

//Register a user
server.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        //check if user exists
        const user = fakeDB.find(user => user.email === email)

        if (user) throw new Error('User already exist');
        //if new user, hash password
        const hashedPassword = await hash(password, 10);
        //insert the user in the database
        fakeDB.push({
            id: fakeDB.length,
            email,
            password: hashedPassword
        })
        res.send({message: 'User Created'});
        console.log(fakeDB);

    } catch (err) {
        res.send({
            error: `${err.message}`,
        });
    }
});

//login user
server.post('/login', async (req, res) => {
    const {email, password } = req.body;

    try {
        //find user in the db & if they don't exist send error
        const user = fakeDB.find(user => user.email === email)
        if (!user) throw new Error("User does not exist");
        
        //compare the encrypted password and see if it checks out; if it doesn't send an error
        const valid = await compare(password, user.password);
        if (!valid) throw new Error("Password not correct");
        
        //create refresh and access token
        //access token should have a shorter lifetime and refresh token a longer lifetime
        const accesstoken = createAccessToken(user.id); 
        const refreshtoken = createRefreshToken(user.id);

        //insert the refreshtoken into the db
        user.refreshtoken = refreshtoken;
        console.log(fakeDB);

        //send refreshtoken as a cookie and the accesstoken as a regular response
        sendRefreshToken(res, refreshtoken);
        sendAccessToken(res, req, accesstoken);

    } catch (err) {
        res.send({
            error: `${err.message}`,
        });
    }
});

//logout user
server.post('./logout', (_req, res) => {
    res.clearCookie('refreshtoken');
    return res.send({
        message: 'LOgged out',
    })
})

//protected route
server.post('/protected', async (req, res) => {
    try {
        const userId = isAuth(req)
    } catch (err) {
        
    }
})

server.listen(process.env.PORT, () =>
    console.log(`Server listenng on port ${process.env.PORT}`),
);