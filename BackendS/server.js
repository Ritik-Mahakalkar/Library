require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456789",  // Replace with your MySQL password
    database: "Ritik"
});

db.connect(err => {
    if (err) {
        console.error("MySQL Connection Error:", err);
        throw err;
    }
    console.log("MySQL Connected...");
});

//  Add a New Member
app.post("/members", (req, res) => {
    const { name, email, phone, join_date } = req.body;
    const sql = "INSERT INTO Members (name, email, phone, join_date) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, email, phone, join_date], (err, result) => {
        if (err) {
            console.error("Error adding member:", err);
            return res.status(500).send(err);
        }
        console.log("Member added successfully, ID:", result.insertId);
        res.send({ message: "Member added successfully", memberId: result.insertId });
    });
});
//  Get All Members
app.get("/members", (req, res) => {
    const sql = "SELECT * FROM Members";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching members:", err);
            return res.status(500).send(err);
        }
        res.send(results);
    });
});

//  Add a New Book
app.post("/books", (req, res) => {
    const { title, author_id } = req.body;

    const checkAuthor = "SELECT * FROM Authors WHERE author_id = ?";
    db.query(checkAuthor, [author_id], (err, results) => {
        if (err) {
            console.error("Error checking author:", err);
            return res.status(500).send({ message: "Internal server error" });
        }

        if (results.length === 0) {
            return res.status(400).send({ message: "Author ID does not exist" });
        }

        const sql = "INSERT INTO Books (title, author_id, available) VALUES (?, ?, TRUE)";
        db.query(sql, [title, author_id], (err, result) => {
            if (err) {
                console.error("Error adding book:", err);
                return res.status(500).send(err);
            }
            res.send({ message: "Book added successfully", bookId: result.insertId });
        });
    });
});
//  Get All Books
app.get("/books", (req, res) => {
    const sql = "SELECT * FROM Books";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching books:", err);
            return res.status(500).send(err);
        }
        res.send(results);
    });
});
//  Issue a Book to a Member
app.post("/issue", (req, res) => {
    const { book_id, member_id } = req.body;

    // Check if the book exists and is available
    const checkBookQuery = "SELECT available FROM Books WHERE book_id = ?";
    db.query(checkBookQuery, [book_id], (err, bookResults) => {
        if (err) {
            console.error("Error checking book availability:", err);
            return res.status(500).send({ message: "Internal server error" });
        }

        if (bookResults.length === 0) {
            return res.status(400).send({ message: "Book ID does not exist" });
        }

        if (!bookResults[0].available) {
            return res.status(400).send({ message: "Book is not available" });
        }

        // Check if the member exists
        const checkMemberQuery = "SELECT * FROM Members WHERE member_id = ?";
        db.query(checkMemberQuery, [member_id], (err, memberResults) => {
            if (err) {
                console.error("Error checking member existence:", err);
                return res.status(500).send({ message: "Internal server error" });
            }

            if (memberResults.length === 0) {
                return res.status(400).send({ message: "Member ID does not exist" });
            }

            // Issue the book
            const issueBookQuery = "INSERT INTO BorrowedBooks (book_id, member_id, issue_date) VALUES (?, ?, CURDATE())";
            db.query(issueBookQuery, [book_id, member_id], (err, result) => {
                if (err) {
                    console.error("Error issuing book:", err);
                    return res.status(500).send(err);
                }

                // Update book status to unavailable
                const updateBookStatusQuery = "UPDATE Books SET available = FALSE WHERE book_id = ?";
                db.query(updateBookStatusQuery, [book_id], (err) => {
                    if (err) {
                        console.error("Error updating book status:", err);
                        return res.status(500).send(err);
                    }
                    console.log("Book issued successfully, Borrow ID:", result.insertId);
                    res.send({ message: "Book issued successfully", borrowId: result.insertId });
                });
            });
        });
    });
});

//  Get All Issued Books
app.get("/issued-books", (req, res) => {
    const sql = `
        SELECT bb.borrow_id, b.title, m.name AS member_name, bb.issue_date, bb.return_date
        FROM BorrowedBooks bb
        JOIN Books b ON bb.book_id = b.book_id
        JOIN Members m ON bb.member_id = m.member_id
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching issued books:", err);
            return res.status(500).send(err);
        }
        res.send(results);
    });
});

// 3️⃣ Return a Book
app.post("/return", (req, res) => {
    const { borrow_id } = req.body;

    const returnBook = "UPDATE BorrowedBooks SET return_date = CURDATE() WHERE borrow_id = ?";
    db.query(returnBook, [borrow_id], (err, result) => {
        if (err) {
            console.error("Error returning book:", err);
            return res.status(500).send(err);
        }
        if (result.affectedRows === 0) {
            console.warn("Borrow record not found for return.");
            return res.status(404).send({ message: "Borrow record not found" });
        }

        const updateBookStatus = "UPDATE Books SET available = TRUE WHERE book_id = (SELECT book_id FROM BorrowedBooks WHERE borrow_id = ?)";
        db.query(updateBookStatus, [borrow_id], (err) => {
            if (err) {
                console.error("Error updating book status after return:", err);
                return res.status(500).send(err);
            }
            console.log("Book returned successfully, Borrow ID:", borrow_id);
            res.send({ message: "Book returned successfully" });
        });
    });
});

// Start the Server
app.listen(4000, () => {
    console.log("Server running on port 4000...");
});
