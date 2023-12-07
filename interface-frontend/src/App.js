import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import CsvUpload from './CsvUpload';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';


function App() {
  const [serialNumber, setSerialNumber] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [databaseData, setDatabaseData] = useState([]);


  const handleSerialNumberSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch(`http://54.235.235.103:5000/lookup?serial_number=${serialNumber}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setResponseMessage(data.response);
    } catch (error) {
        console.error('Fetch error:', error.message);
        setResponseMessage('Error: ' + error.message);
    }
};

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25); // Number of items per page

  // Pagination logic
  const totalPages = Math.ceil(databaseData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = databaseData.slice(indexOfFirstItem, indexOfLastItem);

  

  const fetchDatabaseData = async () => {
    try {
        const response = await fetch('http://54.235.235.103:5000/get_all_data');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setDatabaseData(data);
    } catch (error) {
        console.error('Fetch error:', error.message);
    }
};

  
  useEffect(() => {
      fetchDatabaseData();
  }, []);

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
  }
  const [apiKey, setApiKey] = useState('');
  const clearDatabase = async () => {
    if (window.confirm("Are you sure you want to clear the database? This action cannot be undone.")) {
        try {
            const response = await fetch('http://54.235.235.103:5000/clear_database', {
                method: 'POST',
                headers: {
                    'Authorization': apiKey  // Use the API key from the state
                }
            });

            const data = await response.json();
            if (response.ok) {
                setDatabaseData([]); // Clear the local state holding the database data
                alert(data.response);
            } else {
                throw new Error(data.error || 'Failed to clear the database');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to clear the database: ' + error.message);
        }
    }
};



  return (
    <Router>  
      <div className="App">
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <Link className="navbar-brand" to="/">DB Interface</Link>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link" to="/upload-csv">CSV Upload/Download</Link>
              </li>
              {/* Add more navbar items here if needed */}
            </ul>
          </div>
        </nav>

      <Routes>
          <Route path="/upload-csv" element={<CsvUpload />} />
          <Route path="/" element={
              <>
              {/* Place your main page content here */}
              <h2>Database Contents</h2>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="thead-dark">
                        <tr>
                            <th>Serial Number</th>
                            <th>Full Name</th>
                            <th>SIM Number</th>
                            {/* Add other columns as necessary */}
                        </tr>
                    </thead>
                    <tbody>
                    {currentItems.map((row, index) => (
                            <tr key={index}>
                                <td>{row.serial_number}</td>
                                <td>{row.full_name}</td>
                                <td>{row.sim_number}</td>
                                {/* Render other fields as necessary */}
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="d-flex justify-content-center my-4">
                  <nav>
                      <ul className="pagination">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                                  Previous
                              </button>
                          </li>
                          {pageNumbers.map(number => (
                              <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                                  <button className="page-link" onClick={() => setCurrentPage(number)}>
                                      {number}
                                  </button>
                              </li>
                          ))}
                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                              <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                                  Next
                              </button>
                          </li>
                      </ul>
                  </nav>
              </div>
              
              <div className="container my-5">
                <div className="card">
                    <div className="card-body">
                        <div className="mb-3">
                            <input 
                                type="text" 
                                className="form-control" 
                                value={apiKey} 
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Enter API Key"
                            />
                        </div>
                        <button className="btn btn-danger" onClick={clearDatabase}>Clear Database</button>
                    </div>
                </div>
              </div>

              <div className="container my-5">
                <div className="card">
                    <div className="card-body">
                        <form onSubmit={handleSerialNumberSubmit} className="mb-3">
                            <div className="input-group">
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={serialNumber} 
                                    onChange={(e) => setSerialNumber(e.target.value)}
                                    placeholder="Enter Serial Number"
                                />
                                <button type="submit" className="btn btn-primary">Lookup</button>
                            </div>
                        </form>
                        {/* Response Message */}
                        {responseMessage && <p>{responseMessage}</p>}
                    </div>
                </div>
              </div>
              </>
        } />
      </Routes>
    </div>
    </Router>
  );
}

export default App;

