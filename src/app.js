import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'


const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true, limit:'16kb'}))
app.use(express.static('public'))
app.use(cookieParser())

//route import
import authRouter from './routes/auth.routes.js'
import userRouter from './routes/user.routes.js'
import companyRouter from './routes/company.routes.js'
import leadRouter from './routes/lead.routes.js'
import historyRouter from './routes/history.routes.js'

//declaration
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/companies', companyRouter)
app.use('/api/v1/leads', leadRouter)
app.use('/api/v1/leads', historyRouter)

export {app}