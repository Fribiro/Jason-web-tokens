
require('dotenv/config');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { verify } = require('jsonwebtoken');
const { hash, compare } = require('bcryptjs');

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

server.listen(process.env.PORT, () =>
    console.log(`Server listenng on port ${process.env.PORT}`),
); 

//Register a user
server.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        //check if user exists

        const hashedPassword = await hash(password, 10);
        console.log(hashedPassword);

    } catch (err) {
        
    }
})