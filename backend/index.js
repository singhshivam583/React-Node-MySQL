import cookieParser from 'cookie-parser';
import express from 'express';
import mysql from 'mysql';

const app = express()
app.use(express.json());
app.use(cors());
app.use(cookieParser());

//Database Connection

const dbConnect = mysql.createConnection({
    host: "localhost",
    port:"3306",
    user: "root",
    password: "",
    database: "test",
})

dbConnect.connect((err) => {
    if (err) {
      console.error('Error connecting to database:', err.stack);
      return;
    }
    console.log('Connected to database as ID', dbConnect.threadId);
});

app.get('/health', (req,res) => {
    return res.json("Everything is OK")
})

app.get("/books", (req,res) => {
    const q = "SELECT * FROM books";
    dbConnect.query(q, (err, results, fields) => {
        // err ? console.log(err) : res.json(results)
        if(err) return res.status(500).json('Error getting the data');  
        return res.status(200).json(results);
    })
});

app.listen(8800, ()=>{
    console.log("Sever Running at 8800")
})

