import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [serialNumber, setSerialNumber] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');

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


  const handleCsvUpload = async (e) => {
      e.preventDefault();
      if (!csvFile) {
          alert('Please select a CSV file to upload');
          return;
      }
      const formData = new FormData();
      formData.append('file', csvFile);

      // Replace with your backend URL and endpoint
      const response = await fetch('http://54.235.235.103:5000/upload_csv', {
          method: 'POST',
          body: formData
      });
      const data = await response.json();
      setResponseMessage(data.response);
  };

  const [databaseData, setDatabaseData] = useState([]);

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

  return (
    <div className="App">
      <header className="App-header">
        <h1>Serial Number Lookup and CSV Upload</h1>
        
        {/* Serial Number Lookup Form */}
        <form onSubmit={handleSerialNumberSubmit}>
          <input 
              type="text" 
              value={serialNumber} 
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="Enter Serial Number"
          />
          <button type="submit">Lookup</button>
        </form>

        {/* CSV File Upload Form */}
        <form onSubmit={handleCsvUpload}>
          <input 
              type="file" 
              onChange={(e) => setCsvFile(e.target.files[0])}
              accept=".csv"
          />
          <button type="submit">Upload CSV</button>
        </form>

        {/* Response Message */}
        {responseMessage && <p>{responseMessage}</p>}
      </header>
      <h2>Database Contents</h2>
        <table>
            <thead>
                <tr>
                    <th>Serial Number</th>
                    <th>Full Name</th>
                    <th>SIM Number</th>
                    {/* Add other columns as necessary */}
                </tr>
            </thead>
            <tbody>
                {databaseData.map((row, index) => (
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
  );
}

export default App;

