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

const users = [
  {
    _id: 'user123',
    firstnName: 'mertcan',
    lastName: 'cetinkaya',
    email: 'mertcan@mertcan.com',
    password: '1234',
  },
]

const route = () => {
  const router = new express.Router()
  router.route('/login').post((req, res) => {
    const { email, password } = req.body

    const user = users.find((user) => user.email === email)
    if (!user) {
      res.send({
        status: false,
        message: 'Böyle bir email adresi yok!!!',
      })
    } else {
      if (user.password === password) {
        const token = jwt.sign({ userId: user._id }, config.jwtSecret)
        res.send({ status: true, token: token })
      } else {
        res.send({ status: false, message: 'hatalı sifre' })
      }
    }
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
      dateCreated: new Date(),
      dateModified: new Date(),
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
