
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

const {fakeDB} = require('./fakeDB');
const { isAuth } = require('./isAuth');

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
server.post('/logout', (_req, res) => {
    res.clearCookie('refreshtoken', { path: '/refresh_token' });
    return res.send({
        message: 'Logged out',
    });
});

//protected route
server.post('/protected', async (req, res) => {
    try {
        const userId = isAuth(req);
        if (userId != null ) {
            res.send ({
                data: 'This is protected data.',
            })
        }
    } catch (err) {
        res.send ({
            error: `${err.message}`,
        })
    }
})

//get a new access token with a refresh token
server.post('/refresh_token', (req, res) => {
    const token = req.cookies.refreshtoken;
    //if we don't have a token in our request
    if (!token) return res.send({ accesstoken: '' });
    //if we have a token, verify it
    let payload = null;
    try {
        payload = verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        return res.send({ accesstoken: '' });
    }
    //if the token is valid, check if the user exists
    const user = fakeDB.find(user => user.id === payload.userId);
    if (!user) return res.send({ accesstoken: '' });
    //if the user exists check if a refreshtoken exists n the user
    if (user.refreshtoken !== token ) {
        return res.send({ accesstoken: ''});
    }
    //token exists, create new refresh and access token
    //*refactor code to avoid repetitiveness
    const accesstoken = createAccessToken(user.id);
    const refreshtoken = createRefreshToken(user.id);
    user.refreshtoken = refreshtoken;

    //send new refresh and accestoken
    sendRefreshToken(res, refreshtoken);
    return res.send({ accesstoken });

});

server.listen(process.env.PORT, () =>
    console.log(`Server listenng on port ${process.env.PORT}`),
);