import cookieParser from 'cookie-parser';
import express from 'express';
import mysql from 'mysql';
import bcrypt from 'bcrypt';

const salt = 10;

const app = express()
app.use(express.json());
app.use(cors());
// cors({
// origin:[localhost:],
// methods:[get, PUT, DELETE],
// credentials: true,
// })
app.use(cookieParser());

//Database Connection

const dbConnect = mysql.createConnection({
    host: "localhost",
    port: "3306",
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


//api

app.get('/health', (req, res) => {
    return res.json("Everything is OK")
})

const jwtVerify = (req, res, next) => {
    const token = req.cookie.token;
    if (!token) {
        return res.status(400).json({ Message: "Your are not authenticated" })
    }
    jwt.verify(token, "jwt-secret-key", (err, decode) => {
        if (err) return res.status(402).json({ Error: "Token match failed" });

        req.id = decode.id;
        req.name = decode.name;
        req.namemaile = decode.email;
        next();
    })
}

app.get("/", jwtVerify, (req, res) => {
    user = { id: req.id, name: req.name, email: req.email };
    return res.status(201).json({ Message: `Welcome ${req.name}`, Data: user })
})
app.post('/register', (req, res) => {
    const sql = "INSERT INTO user (username, email, password) VALUES ?";
    bcrypt.hash(req.body.password.toString(), salt, (err, hash) => {
        if (err) return res.json({ Error: "Error for hashing password" });
        const values = [req.body.name, req.body.email, hash]

        dbConnect.query(sql, [values], (err, result) => {
            if (err) return res.status(500).json({ Error: "Inserting Data Error in server" });
            return res.status(201).json(`User created with id ${result.insertId}`);
        });
    })
})

app.post('/login', (req, res) => {
    const sql = "Select * from user where email=?";
    dbConnect.query(sql, [req.body.email], (err, result) => {
        if (err) return res.status(500).json({ Error: "Login Error in server" });
        if (result.length > 0) {
            bcrypt.compare(req.body.password.toString(), result[0].password, (err, response) => {
                if (err) return res.json({ Error: 'Password hash error' })
                if (response) {
                    const id = response[0].id;
                    const name = response[0].name;
                    const email = response[0].email;

                    const token = jwt.sign({ id, name, email }, "jwt-secret-key", { expiresIn: '1d' })
                    if (token == null) {
                        return res.status(403).send({ Message: 'Cookie not created' });
                    }
                    res.cookie('token', token);
                    return res.json({ Message: "User Logged In", User: result[0], Token: token })
                } else {
                    return res.status(400).json({ Message: 'Wrong Password' })
                }
            })
        } else {
            return res.status(403).json({ Error: "Email not found!" });
        }

        return res.status(201).json(`User logged in with id ${result.insertId}`);

    })

})




// app.get("/books", (req,res) => {
//     const q = "SELECT * FROM books";
//     dbConnect.query(q, (err, results, fields) => {
//         // err ? console.log(err) : res.json(results)
//         if(err) return res.status(500).json('Error getting the data');  
//         return res.status(200).json(results);
//     })
// });

app.listen(8800, () => {
    console.log("Sever Running at 8800")
})

