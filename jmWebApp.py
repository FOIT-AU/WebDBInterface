from requests import Response
from flask import Flask, request, jsonify
import mysql.connector
import io
import os
import tempfile
import boto3
from werkzeug.utils import secure_filename
import csv
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


# DB Structure:
# machines_table
	
	# id int NOT NULL AUTO_INCREMENT,
	# first_name varchar(255),
	# last_name varchar(255),
	# full_name varchar(255),
	# username varchar(255),
	# state varchar(255),
	# school varchar(255),
	# serial_number varchar(255),
	# sim_number varchar(255),
	# email varchar(255),
	# phone varchar(255),
	# PRIMARY KEY (id)



# Hardcoding parameters because I am a menance
db_host = TODO
db_user = TODO
db_password = TODO
db_name = TODO
db_apitoken = TODO

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

@app.route('/retrieve_student', methods=['GET'])
def retrieve_student():
    key = request.args.get('serial_number')
    if not key:
        return jsonify({'response': 'Serial number is missing'}), 400

    conn = get_db_connection()
    try:
        # Start transaction
        conn.start_transaction()

        # Check if a record with the provided serial_number already exists
        check_cursor = conn.cursor(dictionary=True)
        check_cursor.execute(
            'SELECT full_name FROM machines_table WHERE serial_number = %s', (key,)
        )
        existing_row = check_cursor.fetchone()

        if existing_row:
            # If the record exists, return the full_name without updating
            conn.commit()
            return jsonify({'response': existing_row['username']})

        # If the record does not exist, proceed to find and update a record
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            'SELECT id, full_name FROM machines_table WHERE serial_number IS NULL OR serial_number = "" ORDER BY state, school, last_name LIMIT 1 FOR UPDATE'
        )
        row = cursor.fetchone()

        if row:
            # Update the record with the provided serial_number
            update_cursor = conn.cursor()
            update_cursor.execute(
                'UPDATE machines_table SET serial_number = %s WHERE id = %s',
                (key, row['id'])
            )
            conn.commit()

            return jsonify({'response': row['username']})
        else:
            conn.commit()
            return jsonify({'response': ''})

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500

    finally:
        conn.close()


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

    try:
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
                # Check if the row has the expected number of columns (4 in this case)
                if len(row) != 4:
                    raise ValueError("Incorrect number of columns in row.")

                full_name = f"{row[0]} {row[1]}"  # Concatenating first_name and last_name
                first_name = row[0]
                last_name = row[1]
		if  len(first_name) > 20:
		    username = first_name[:20]
		elif len(full_name) > 20:
		    username = first_name
		else:
		    username = full_name
		
                state = row[2]
                school = row[3]
                email = row[4]
                phone = row[5]
                
                cursor.execute(
                    'INSERT INTO machines_table (full_name, first_name, last_name, username, state, school, email, phone) VALUES (%s, %s, %s, %s, %s)',
                    (full_name, first_name, last_name, username, state, school, email, phone)
                )

            conn.commit()

        return jsonify({'response': 'CSV data uploaded successfully'})

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500

    finally:
        if conn:
            conn.close()
        # Clean up: remove the temporary file and directory
        os.remove(temp_path)
        os.rmdir(temp_dir)



@app.route('/get_all_data', methods=['GET'])
def get_all_data():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT * FROM machines_table')  # Adjust the query as needed
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(rows)

@app.route('/export_csv', methods=['GET'])
def export_csv():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True, buffered=True)
        cursor.execute('SELECT * FROM machines_table')

        si = StringIO()
        cw = csv.writer(si)
        cw.writerow([i[0] for i in cursor.description])  # write headers

        # Fetch and write each row to avoid leaving unread results
        for row in cursor:
            cw.writerow(row.values())

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        cursor.close()
        conn.close()

    output = si.getvalue()
    si.close()

    return Response(
        output,
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=export.csv"}
    )



@app.route('/clear_database', methods=['POST'])
def clear_database():
    api_token = request.headers.get('Authorization')
    correct_token = db_apitoken  # Store this securely

    if api_token != correct_token:
        return jsonify({'error': 'Unauthorized'}), 403
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM machines_table")  
        conn.commit()
        conn.close()
        return jsonify({'response': 'Database cleared successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500



# host = 0.0.0.0 for public availability.
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
