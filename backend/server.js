const express=require("express");
const cors=require("cors");
const mysql=require("mysql2");


const app=express();
app.use(express.json());

app.use(cors());

const db=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"rohit",
    database:"student"
})
// Connect to the database
db.connect((err) => {
    if (err) {
        console.error("Error connecting to the database:", err.message);
    } else {
        console.log("Connected to the database successfully!");
    }
});

app.post('/create',(req,res)=>{
    const sql="insert into books(`title`,`author`,`publication_year`,`availability_status`) values(?)";
    const values = [
        req.body.title,
        req.body.author,
        req.body.year,
        req.body.status
    ]
    db.query(sql,[values],(err,data)=>{
        if(err)return res.json("Errorr!!!");
        else{
            console.log("details added successfully");
            return res.json(data);
        }
        
    })
})

app.put('/update/:id',(req,res)=>{
    const sql="update books set `title`= ?, `author`= ?, `publication_year`= ?, `availability_status`= ? where id= ?";
    const values = [
        req.body.title,
        req.body.author,
        req.body.year,
        req.body.status
    ]
    const id=req.params.id;
    db.query(sql,[...values,id],(err,data)=>{
        if(err){
            console.log("Error ha",err)
            return res.json("Errorr!!!");
        }
        else{
            console.log("details updated successfully");
            return res.json(data);
        }
        
    })
})

app.get("/",(req,res)=>{
    const sql="select * from books";
    db.query(sql,(err,data)=>{
        if(err)
            return res.json("error");
        return res.json(data);
    })

})

app.delete('/book/:id',(req,res)=>{
    const sql="delete from books where id = ?";
    
    const id=req.params.id;
    db.query(sql,[id],(err,data)=>{
        if(err)return res.json("Errorr!!!");
        else{
            console.log("deleted successfully");
            return res.json(data);
        }
        
    })
})

// Borrow a book
app.post('/borrow', (req, res) => {
    const { book_id, user_id, borrow_date } = req.body;
    
    // First, check if the book is available
    const checkAvailabilitySql = "SELECT availability_status FROM books WHERE id = ?";
    db.query(checkAvailabilitySql, [book_id], (err, result) => {
        if (err) return res.json("Error checking availability");
        
        if (result.length > 0 && result[0].availability_status === 'available') {
            // Mark the book as checked out
            const updateBookStatusSql = "UPDATE books SET availability_status = 'checked out' WHERE id = ?";
            db.query(updateBookStatusSql, [book_id], (err) => {
                if (err) return res.json("Error updating book status");

                // Add the transaction record
                const sql = "INSERT INTO transactions (book_id, user_id, borrow_date) VALUES (?, ?, ?)";
                db.query(sql, [book_id, user_id, borrow_date], (err, data) => {
                    if (err) return res.json("Error borrowing book");
                    return res.json({ message: "Book borrowed successfully", data });
                });
            });
        } else {
            return res.json("Book is not available");
        }
    });
});





app.listen(5000,()=>{
    console.log("listening");
})