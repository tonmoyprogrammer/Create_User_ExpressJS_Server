
import express, { type Application, type Request, type Response } from "express"
import {Pool} from "pg"
import config from "./config"
const app : Application= express()
const port = config.port

app.use(express.json())
const pool = new Pool({
  connectionString:config.connection_string
})

const apiCreating = async()=>
{
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      name VARCHAR(30) NOT NULL,
      email VARCHAR(30) UNIQUE NOT NULL,
      password VARCHAR(20) NOT NULL,
      age INT,
      is_active BOOLEAN DEFAULT true,
      country VARCHAR(30) DEFAULT 'Bangladesh',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      
      )
      `)
      /* console.log("Server data created successfully") */
  } catch (error) {
    console.log(error)
  }
}
apiCreating()


//This is Root route

app.get('/', (req : Request, res : Response) => {
  res.status(200).json({
    message:"Welcome to my project",
    author : "programmer tonmoy"
  })
})


//This is the post mehod,adding user in /api/users route with postgresql

app.post("/api/users",async(req:Request,res:Response)=>
{
  const {name,email,password,age} = req.body;
 try {
  const result =  await pool.query(`
    INSERT INTO users(name,email,password,age) VALUES($1,$2,$3,$4)
    RETURNING *
    `,[name,email,password,age])
      res.status(201).json({
        success:true,
        message:"user created successfully",
        data:result.rows[0]
      })
 } catch (error :any ) {
  res.status(501).json({
    success:false,
    message : error.message,
    error : error

  })
 }

})

//This is users get method with showing postgreSQL method

app.get("/api/users",async(req:Request,res:Response)=>
{
  try {
    const result = await pool.query(`
      SELECT * FROM users
      `)
        res.status(201).json({
        success:true,
        message:"user retrived successfully",
        data:result.rows
      })

  } catch (error :any ) {
  res.status(501).json({
    success:false,
    message : error.message,
    error : error
  })
}
})

//Get a single user with from users in get method using postgreSQL

app.get("/api/users/:id",async(req:Request , res: Response)=>
{
  const id = req.params;
  console.log()
})



























app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
