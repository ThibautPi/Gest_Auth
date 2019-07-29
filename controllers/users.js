const JWT = require('jsonwebtoken');
const { JWT_SECRET} = require('../configuration/index');
const User = require('../models/user');

signToken = function(user) {
  return JWT.sign({
    iss: 'CodeWorkr',
    sub: user._id,
    iat: new Date().getTime(),
    exp: new Date().setDate(new Date().getDate() + 1) //current time + 1 day ahead
  }, JWT_SECRET);
}
module.exports ={
  signUp: async function(req,res,next){
    const { email, password } = req.value.body;
    //check if there is user with same e-email
    const foundUser =await User.findOne({"local.email" : email});
    if(foundUser){
      return res.status(403).send({error: 'Email is already in use'});
    }
    //create a new user
    const newUser = new User({
      method: 'local',
      local:{
        email: email,
        password: password
      }
    });
    await newUser.save();
    //respond with token
    const token = signToken(newUser)

    res.status(200).json({token});
  },

  signIn: async function(req,res,next){
    const token = signToken(req.user);
    res.status(200).json({token});
  },

  googleOAuth: async function(req,res,next){
    const token = signToken(req.user);
    res.status(200).json({token});
  },

  /*githubOAuth: async function(req,res,next){
    console.log('req',req);
    const token = signToken(req.user);
    res.status(200).json({token});
  },*/

  secret: async function(req,res,next){
    console.log('I managed to get here');
    console.log(req);
    res.json({secret:"resource"})
  }


}
