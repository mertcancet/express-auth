import express from 'express'
import config from 'config'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import crypto from 'crypto'
import User from '../../models/User'

mongoose.connect(
  'mongodb://localhost:27017/auth_db',
  { useNewUrlParser: true, useUnifiedTopology: true },
  (error) => {
    if (!error) {
      console.log('DB CONNECTION SUCCESFULL')
    } else {
      console.log('DB CONNECTION NOT SCCUESFULL')
    }
  }
)

const route = () => {
  const router = new express.Router()
  router.route('/login').post((req, res) => {
    const { email, password } = req.body

    User.findOne({ email: email }).then((user) => {
      if (!user) {
        res.send({
          status: false,
          message: 'Böyle bir email adresi yok!!!',
        })
      } else {
        if (
          user.password ===
          crypto
            .createHmac('sha256', config.passSecret)
            .update(password)
            .digest('hex')
        ) {
          const token = jwt.sign({ userId: user._id }, config.jwtSecret)

          User.update(
            { email: email },
            {
              $set: {
                lastLogin: new Date(),
              },
            }
          ).then(() => {})
          res.send({ status: true, token: token })
        } else {
          res.send({ status: false, message: 'hatalı sifre' })
        }
      }
    })
  })

  router.route('/signup').post((req, res) => {
    const { email, password } = req.body
    const passwordHashed = crypto
      .createHmac('sha256', config.passSecret)
      .update(password)
      .digest('hex')

    const newUser = new User({
      email: email,
      password: passwordHashed,
    })
    newUser.save().then(
      (data) => {
        res.send({ status: true, user: data })
      },
      (err) => {
        res.send({ status: false, error: err })
      }
    )
  })
  return router
}

export default {
  route,
  routePrefix: `/${config.version}/auth`,
}
