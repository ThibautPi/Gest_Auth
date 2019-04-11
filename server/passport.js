const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const GooglePlusTokenStrategy = require('passport-google-plus-token');
const GitHubStrategy = require('passport-github2');
const config = require('./configuration');
const User = require('./models/user');

//JSON WEB TOKENS STRATEGY
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: config.JWT_SECRET
}, async function(payload,done){
  try{
    //FIND THE USER SPECIFIED IN token
    const user = await User.findById(payload.sub);
    //IF USER DOESN'T EXIST,HANDLE it
    if(!user){
      return done(null,false);
    }
    //OTHERWISE, RETURN USER
    done(null,user);
  } catch (error){
    done(error,false);
  }
}));
// GOOGLE OAUTH STRATEGY
passport.use("googleToken",new GooglePlusTokenStrategy({
  clientID: config.oauth.google.clientID,
  secret: config.oauth.google.clientSecret
},async function(accessToken,refreshToken,profile,done){
  try{
    //Check wether this current user exists in our
    const existingUser = await User.findOne({"google.id": profile.id});
    if(existingUser){
      console.log("user already exists in our DB");
      return done(null,existingUser);
    }

    //if new account
    const newUser = new User({
      method:'google',
      google:{
        id:profile.id,
        email:profile.emails[0].value
      }
    });

    await newUser.save();
    done(null,newUser);
  }
  catch(error){
    done(null,false,error.message);

  }
}));

//GITHUB STRATEGY
passport.use("githubToken",new GitHubStrategy({
  clientID: config.oauth.github.clientID,
  clientSecret: config.oauth.github.clientSecret,
  callbackURL: "htpp://localhost:3000"
},async function(accessToken,refreshToken,profile,done){
  try{
    //Check wether this current user exists in our
    console.log(profile);
    const existingUser = await User.findOne({"github.id": profile.id});
    if(existingUser){
      console.log("user already exists in our DB");
      return done(null,existingUser);
    }

    //if new account
    const newUser = new User({
      method:'github',
      github:{
        id:profile.id,
        email:profile.emails[0].value
      }
    });

    await newUser.save();
    done(null,newUser);
  }
  catch(error){
    done(null,false,error.message);

  }
}));

// LOCAL STRATEGY
passport.use(new LocalStrategy({
  usernameField: 'email'
}, async function(email,password,done){
  try{
    //FIND THE USER GIVEN THE email
    const user = await User.findOne({"local.email":email});
    //IF NOT, HANDLE IT
    if(!user){
      return done(null,false);
    }
    // Check if the password is correct
    const isMatch = await user.isValidPassword(password);
    //if not, handle it
    if(!isMatch)
      return done(null,false);
    //OTHERWISE, RETURN USER
    done(null, user);
  } catch (error){
    done(error,false);
  }
}));
