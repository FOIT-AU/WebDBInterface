# WebDBInterface

A Python-based web application leveraging the Flask framework to interact with a MySQL database and AWS services. This application enables efficient management of a database containing usernames, serial numbers, and related data via various RESTful APIs. It provides endpoints for retrieving, updating, uploading, and exporting data.

---

## Features

- **Database Interaction**
  - Retrieve full names based on serial numbers.
  - Update records in the database with new serial numbers and SIM numbers.
  - Export the entire database as a CSV file.
  - Clear all database records securely using an API token.

- **CSV File Upload**
  - Upload CSV files to populate the database with names, states, and schools.

- **AWS Integration**
  - Fetch secure database credentials and API tokens from AWS Systems Manager Parameter Store.

- **CORS Enabled**
  - Cross-Origin Resource Sharing (CORS) is enabled for easier integration with other web applications.

---

## Prerequisites

- Python 3.x
- A MySQL database
- AWS credentials with access to the Parameter Store
- Required Python libraries (see `requirements.txt`)

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/WebDBInterface.git
   cd WebDBInterface
   ```

2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up your AWS credentials:
   - Ensure that the AWS CLI is configured with credentials that have access to the required Parameter Store parameters.

4. Set up your database:
   - Ensure a MySQL database is running and contains a table named `machines_table` with the appropriate schema.

---

## Usage

### Run the Application

Start the Flask application:
```bash
python jmWebApp.py
```

The app will run at `http://localhost:5000` by default.

### Endpoints

#### 1. **Retrieve Full Name**
   - **URL**: `/lookup`
   - **Method**: GET
   - **Query Parameter**: `serial_number`
   - **Description**: Retrieves the full name for a given serial number.

#### 2. **Retrieve or Update Student Record**
   - **URL**: `/retrieve_student`
   - **Method**: GET
   - **Query Parameter**: `serial_number`
   - **Description**: Retrieves or updates a student record with the provided serial number.

#### 3. **Insert SIM Number**
   - **URL**: `/insert`
   - **Method**: POST
   - **Body**:
     ```json
     {
       "serial_number": "<value>",
       "sim_number": "<value>"
     }
     ```
   - **Description**: Updates the database with a SIM number for the given serial number.

#### 4. **Upload CSV**
   - **URL**: `/upload_csv`
   - **Method**: POST
   - **File**: Upload a CSV file containing student data.

#### 5. **Export Database as CSV**
   - **URL**: `/export_csv`
   - **Method**: GET
   - **Description**: Exports all data in the database as a CSV file.

#### 6. **Get All Data**
   - **URL**: `/get_all_data`
   - **Method**: GET
   - **Description**: Retrieves all records from the database.

#### 7. **Clear Database**
   - **URL**: `/clear_database`
   - **Method**: POST
   - **Header**: `Authorization: <API_TOKEN>`
   - **Description**: Deletes all records from the database. Requires a valid API token.

---

## Security Considerations

- **API Token**: Ensure that the API token used for the `/clear_database` endpoint is stored securely and not exposed in the code.
- **Database Credentials**: Credentials are securely fetched from AWS Systems Manager Parameter Store.

---

## Requirements

Install using:
```bash
pip install -r requirements.txt
```

---

## Troubleshooting

- **AWS Parameter Store Issues**:
  - Ensure the AWS CLI is correctly configured with credentials.
  - Verify that the required parameters are present in the Parameter Store.

- **Database Connection Errors**:
  - Check the database host, user, and password.
  - Ensure the database is running and accessible.

- **CORS Errors**:
  - Verify that the CORS settings in the Flask app match the requirements of your frontend.
