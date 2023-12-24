// CsvUpload.js
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import config from './config';

function CsvUpload() {
    const [csvFile, setCsvFile] = useState(null);
    const [responseMessage, setResponseMessage] = useState('');

    const handleCsvUpload = async (e) => {
        e.preventDefault();
        if (!csvFile) {
            setResponseMessage('Please select a CSV file to upload');
            return;
        }
        const formData = new FormData();
        formData.append('file', csvFile);
    
        try {
            const response = await fetch(`${config.API_BASE_URL}/upload_csv`, {
                method: 'POST',
                body: formData
            });
    
            const data = await response.json();
            
            if (response.ok) {
                setResponseMessage(data.response || 'CSV uploaded successfully.');
            } else {
                // Handle server-side errors (e.g., validation errors, server issues)
                setResponseMessage(data.error || 'Failed to upload CSV. Please check the file format and try again.');
            }
        } catch (error) {
            // Handle network errors or issues with the fetch request
            console.error('Upload Error:', error);
            setResponseMessage('An error occurred while uploading: ' + error.message);
        }
    };
    

    const downloadCsv = async () => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/export_csv`);
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
                - Column 1: First Name<br/>
                - Column 2: Last Name<br/>
                - Column 3: State<br/>
                - Column 4: School<br/>
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
