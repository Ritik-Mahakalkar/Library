import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Library = () => {
    const [member, setMember] = useState({ name: "", email: "", phone: "", join_date: "" });
    const [members, setMembers] = useState([]);
    const [book, setBook] = useState({ title: "", author_id: "" });
    const [issue, setIssue] = useState({ book_id: "", member_id: "" });
    const [returnBook, setReturnBook] = useState({ borrow_id: "" });
    const [issuedBooks, setIssuedBooks] = useState([]);

    useEffect(() => {
        fetch("http://localhost:4000/members")
            .then(response => response.json())
            .then(data => setMembers(data));
        
        fetch("http://localhost:4000/issued-books")
            .then(response => response.json())
            .then(data => setIssuedBooks(data));
    }, []);

    const handleChange = (e, setter) => {
        setter(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (url, data) => {
        await fetch(`http://localhost:4000/${url}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        alert(`${url} successful!`);
    };

    return (
        <div className="container mt-5" style={{ maxWidth: "900px" }}>
            <h1 className="text-center mb-5 fw-bold" style={{ color: "black" }}>Library Management System</h1>
            
            <div className="row g-4">
                {[{
                    title: "Add Member",
                    state: member,
                    setter: setMember,
                    fields: [
                        { name: "name", type: "text", placeholder: "Name" },
                        { name: "email", type: "email", placeholder: "Email" },
                        { name: "phone", type: "text", placeholder: "Phone" },
                        { name: "join_date", type: "date", placeholder: "Join Date" }
                    ],
                    button: { text: "Add Member", endpoint: "members" }
                }, {
                    title: "Add Book",
                    state: book,
                    setter: setBook,
                    fields: [
                        { name: "title", type: "text", placeholder: "Book Title" },
                        { name: "author_id", type: "number", placeholder: "Author ID" }
                    ],
                    button: { text: "Add Book", endpoint: "books" }
                }, {
                    title: "Issue Book",
                    state: issue,
                    setter: setIssue,
                    fields: [
                        { name: "book_id", type: "number", placeholder: "Book ID" },
                        { name: "member_id", type: "number", placeholder: "Member ID" }
                    ],
                    button: { text: "Issue Book", endpoint: "issue" }
                }, {
                    title: "Return Book",
                    state: returnBook,
                    setter: setReturnBook,
                    fields: [
                        { name: "borrow_id", type: "number", placeholder: "Borrow ID" }
                    ],
                    button: { text: "Return Book", endpoint: "return" }
                }].map((section, index) => (
                    <div key={index} className="col-lg-6">
                        <div className="card shadow-lg border-0 rounded-lg p-4 d-flex flex-column justify-content-between" style={{ minHeight: "350px" }}>
                            <h3 className="text-center text-secondary mb-3 fw-semibold">{section.title}</h3>
                            {section.fields.map((field, idx) => (
                                <input 
                                    key={idx}
                                    className="form-control mb-2"
                                    type={field.type}
                                    name={field.name}
                                    placeholder={field.placeholder}
                                    onChange={e => handleChange(e, section.setter)}
                                />
                            ))}
                            <button 
                                className="btn btn-dark w-100 fw-bold"
                                onClick={() => handleSubmit(section.button.endpoint, section.state)}
                            >
                                {section.button.text}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-5">
                <h2 className="text-center text-secondary fw-bold">All Members</h2>
                <div className="table-responsive">
                    <table className="table table-bordered table-striped mt-3 shadow-sm text-center">
                        <thead className="table-dark">
                            <tr>
                                <th>Member ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Join Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.length > 0 ? (
                                members.map(member => (
                                    <tr key={member.member_id}>
                                        <td>{member.member_id}</td>
                                        <td>{member.name}</td>
                                        <td>{member.email}</td>
                                        <td>{member.phone}</td>
                                        <td>{member.join_date}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-muted">No members found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-5">
                <h2 className="text-center text-secondary fw-bold">Issued Books</h2>
                <div className="table-responsive">
                    <table className="table table-bordered table-striped mt-3 shadow-sm text-center">
                        <thead className="table-dark">
                            <tr>
                                <th>Borrow ID</th>
                                <th>Title</th>
                                <th>Member Name</th>
                                <th>Issue Date</th>
                                <th>Return Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {issuedBooks.length > 0 ? (
                                issuedBooks.map(book => (
                                    <tr key={book.borrow_id}>
                                        <td>{book.borrow_id}</td>
                                        <td>{book.title}</td>
                                        <td>{book.member_name}</td>
                                        <td>{book.issue_date}</td>
                                        <td>{book.return_date}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-muted">No issued books found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Library;
