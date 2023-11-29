const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const LocalStrategy = require('passport-local').Strategy

const { ExtractJwt } = require('passport-jwt')
const { JWT_SECRET } = require('../configs/index')

const User = require('../models/User')
// passport-jwt là cách thức của passport nên cần cài passport để sử dụng

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken('Authorization'),
  secretOrKey: JWT_SECRET,
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.sub)
    if (!user) return done(null, false)
    done(null, user)
    // Hàm này chạy được -> mới cho nhảy sang hàm khác -> secret function
  } catch (error) {
    done(error, false)
  }
}))

// local
passport.use(new LocalStrategy({
  usernameField: 'email'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email })

    if (!user) return done(null, false)
  
    const isCorrectPassword = await user.isValiedPassword(password)
  
    if (!isCorrectPassword) return done(null, false)
  
    done(null, user)
  } catch {
    done(error, false)
  }
}))