
import express, { type Application, type Request, type Response } from "express"
import { Pool } from "pg"
import config from "./config"
const app: Application = express()
const port = config.port

app.use(express.json())
const pool = new Pool({
  connectionString: config.connection_string
})

const apiCreating = async () => {
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

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to my project",
    author: "programmer tonmoy"
  })
})


//This is the post mehod,adding user in /api/users route with postgresql

app.post("/api/users", async (req: Request, res: Response) => {
  const { name, email, password, age } = req.body;
  try {
    const result = await pool.query(`
    INSERT INTO users(name,email,password,age) VALUES($1,$2,$3,$4)
    RETURNING *
    `, [name, email, password, age])
    res.status(201).json({
      success: true,
      message: "user created successfully",
      data: result.rows[0]
    })
  } catch (error: any) {
    res.status(501).json({
      success: false,
      message: error.message,
      error: error

    })
  }

})

//This is users get method with showing postgreSQL method

app.get("/api/users", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT * FROM users
      `)
    res.status(201).json({
      success: true,
      message: "users retrived successfully",
      data: result.rows
    })

  } catch (error: any) {
    res.status(501).json({
      success: false,
      message: error.message,
      error: error
    })
  }
})

//Get a single user with from users in get method using postgreSQL

app.get("/api/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
    SELECT * FROM users WHERE id = $1
    `, [id])
      if(result.rows.length === 0)
      {
        res.status(404).json({
       success: false,
        message: "User not found",
        data: {}
    })
        return;
      }

    res.status(201).json({
      success: true,
      message: "user retrived successfully",
      data: result.rows[0]
    })
  } catch (error: any) {
    res.status(501).json({
      success: false,
      message: error.message,
      error: error
    })
  }
})


// This is PUT method with postgreSQL

app.put("/api/users/:id",async(req:Request,res:Response)=>
{
  const id = req.params.id;
 const {name,email,password,is_active,age} = req.body 
    try {
     const result = await pool.query(`
        UPDATE users
         SET name = COALESCE($1,name),
         email = COALESCE($2,email) ,
         password = COALESCE($3,password), 
         age = COALESCE($4,age), 
         is_active = COALESCE($5,is_active)
         WHERE id = $6 RETURNING *
      
        `,[name,email,password,age,is_active,id])
           if(result.rows.length === 0)
      {
        res.status(404).json({
       success: false,
        message: "User not found",
        data: {}
    })
        return;
      }
      res.status(201).json({
      success: true,
      message: "user updated successfully",
      data: result.rows[0]
    })
  } catch (error: any) {
    res.status(501).json({
      success: false,
      message: error.message,
      error: error
    })
  }

})


//This is Delete method using postgreSql

app.delete("/api/users/:id",async(req:Request,res:Response)=>
{
  const {id} = req.params;
try {
  const result = await pool.query(`
    DELETE FROM users WHERE id  =  $1
    `,[id]);
    if(result.rowCount === 0)
    {
      res.status(404).json({
      success: false,
      message: "user not found",
      data:{}
    })
    }
     res.status(201).json({
      success: true,
      message: "user deleted successfully",
    })
} catch (error) {
  console.log(error)
}
})



















app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
