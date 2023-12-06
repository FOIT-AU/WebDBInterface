// CsvUpload.js
import React, { useState } from 'react';

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

    return (
        <div>
            <h2>CSV File Upload</h2>
            <form onSubmit={handleCsvUpload}>
                <input 
                    type="file" 
                    onChange={(e) => setCsvFile(e.target.files[0])}
                    accept=".csv"
                />
                <button type="submit">Upload CSV</button>
            </form>

            {responseMessage && <p>{responseMessage}</p>}
        </div>
    );
}

export default CsvUpload;
