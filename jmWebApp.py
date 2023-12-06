from flask import Flask, request, jsonify
import mysql.connector
import io
import os
import tempfile
import boto3
from werkzeug.utils import secure_filename
import csv

app = Flask(__name__)


# Create a session using credentials from the environment
session = boto3.session.Session(region_name='us-east-1')
ssm = session.client('ssm')

# Function to get parameter
def get_parameter(name, with_decryption=False):
    response = ssm.get_parameter(Name=name, WithDecryption=with_decryption)
    return response['Parameter']['Value']

# Fetching parameters
db_host = get_parameter('/JMPYAPP/DB/DB-ENDPOINT')
db_user = get_parameter('/JMPYAPP/DB/DB-USER')
db_password = get_parameter('/JMPYAPP/DB/DB-PASS', with_decryption=True)
db_name = get_parameter('/JMPYAPP/DB/DB-NAME')

# Database connection function
def get_db_connection():
    return mysql.connector.connect(
        host=db_host,
        user=db_user,
        password=db_password,
        database=db_name
    )


@app.route('/lookup', methods=['GET'])
def lookup():
    key = request.args.get('serial_number')
    if not key:
        return jsonify({'response': 'Serial number is missing'}), 400
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT full_name FROM machines_table WHERE serial_number = %s', (key,))
    row = cursor.fetchone()
    conn.close()
    return jsonify({'response': row['full_name'] if row else 'Not found'})

@app.route('/insert', methods=['POST'])
def insert():
    data = request.get_json()
    serial_number = data.get('serial_number')
    sim_number = data.get('sim_number')

    if not serial_number or not sim_number:
        return jsonify({'response': 'Serial number or SIM number is missing'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE machines_table SET sim_number = %s WHERE serial_number = %s', (sim_number, serial_number))
    conn.commit()
    conn.close()
    return jsonify({'response': 'SIM number inserted successfully'})


@app.route('/upload_csv', methods=['POST'])
def upload_csv():
    if 'file' not in request.files:
        return jsonify({'response': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'response': 'No selected file'}), 400
    
    if file:
        # Save the file temporarily
        temp_dir = tempfile.mkdtemp()
        temp_path = os.path.join(temp_dir, secure_filename(file.filename))
        file.save(temp_path)

        # Open the file and process it
        with open(temp_path, mode='r', encoding='utf-8') as csv_file:
            csv_reader = csv.reader(csv_file)
            next(csv_reader)  # Skip the header row

            conn = get_db_connection()
            cursor = conn.cursor()

            for row in csv_reader:
                cursor.execute(
                    'INSERT INTO machines_table (serial_number, full_name, sim_number) VALUES (%s, %s, %s)',
                    (row[0], row[1], row[2])
                )

            conn.commit()
            conn.close()

        # Clean up: remove the temporary file and directory
        os.remove(temp_path)
        os.rmdir(temp_dir)

        return jsonify({'response': 'CSV data uploaded successfully'})





# host = 0.0.0.0 for public availability.
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
