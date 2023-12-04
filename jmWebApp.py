from flask import Flask, request, jsonify
import mysql.connector
import os
import boto3

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


# host = 0.0.0.0 for public availability.
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
