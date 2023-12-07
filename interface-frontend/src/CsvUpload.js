// CsvUpload.js
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function CsvUpload() {
    const [csvFile, setCsvFile] = useState(null);
    const [responseMessage, setResponseMessage] = useState('');

    const handleCsvUpload = async (e) => {
        e.preventDefault();
        if (!csvFile) {
            alert('Please select a CSV file to upload');
            return;
        }
        const formData = new FormData();
        formData.append('file', csvFile);

        // Backend URL
        const response = await fetch('http://54.235.235.103:5000/upload_csv', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        setResponseMessage(data.response);
    };

    const downloadCsv = async () => {
        try {
            const response = await fetch('http://54.235.235.103:5000/export_csv');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.text();
            const blob = new Blob([data], { type: 'text/csv' });
            const href = await URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = href;
            link.download = 'export.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to download CSV: ' + error.message);
        }
    };
    

    return (
    <>
    <div className="card mb-5">
        <div className="card-body">
            <h5 className="card-title">CSV Formatting Requirements</h5>
            <p className="card-text">
                Ensure your CSV file adheres to the following format:<br/>
                - Column 1: Serial Number<br/>
                - Column 2: Full Name<br/>
                - Column 3: SIM Number<br/>
                The first row should contain headers.
            </p>
        </div>
    </div>  
    <div className="container my-5">
        <h2>CSV File Upload</h2>
        <form onSubmit={handleCsvUpload} className="mb-3">
            <div className="input-group mb-3">
                <input
                    type="file"
                    className="form-control"
                    onChange={(e) => setCsvFile(e.target.files[0])}
                    accept=".csv"
                    id="inputGroupFile02"
                />
            </div>
            <button type="submit" className="btn btn-primary mb-3">Upload CSV</button>
        </form>
    
        {responseMessage && <p className="alert alert-info">{responseMessage}</p>}
    </div>
    <div className="container text-center mb-4">
        <button onClick={downloadCsv} className="btn btn-secondary">Export as CSV</button>
    </div>
    </>
    );
    
}

export default CsvUpload;
