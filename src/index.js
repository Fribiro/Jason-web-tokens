
require('dotenv/config');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { verify } = require('jsonwebtoken');
const { hash, compare } = require('bcryptjs');

//Register a user
//login a user
//logout a user
//setup a protected route
//get a new accesstoken with a refresh token

