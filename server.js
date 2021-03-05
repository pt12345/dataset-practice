require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const MOVIES = require('./movies-data-small.json')

const app = express()
app.use(helmet())
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))
app.use(cors())

app.use(function validateBearerToken(req, res, next) {

    const authToken = req.get('Authorization')
    const apiToken = process.env.API_TOKEN

    if (!authToken || authToken.split(' ')[1] !== apiToken) {
         return res.status(401).json({ error: 'Unauthorized request' })
   }

    next()
})

app.get('/movie', function handleGetMovie(req,res) {
    let response = MOVIES;

    // genre filter
    if (req.query.genre) {
        response = response.filter(movie =>
          movie.genre.toLowerCase().includes(req.query.genre.toLowerCase())
        )
    }

    // country filter
    if (req.query.country) {
        response = response.filter(movie =>
          movie.country.toLowerCase().includes(req.query.country.toLowerCase())
        )
    }

    // avg_vote filter
    if (req.query.avg_vote) {
        response = response.filter(movie =>
            movie.avg_vote >= parseFloat(req.query.avg_vote)
        )
    }
    
    res.json(response)
})

app.use((error, req, res, next) => {
  let response
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }
  res.status(500).json(response)
})

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
  
})