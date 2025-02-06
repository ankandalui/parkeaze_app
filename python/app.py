from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

# Dictionary to store the latest output from each client
client_data = {}

@app.route('/')
def index():
    return "Socket.IO Server is running"

# Event handler for receiving data from clients
@socketio.on('client_data')
def handle_client_data(data):
    client_id = data['client_id']
    output = data['output']

    # Update the client data dictionary
    client_data[client_id] = output

    # Print the data received from the client
    print(f"Received data from Client {client_id}: {output}")

    # Optionally, broadcast the data to all connected clients
    emit('update_data', {'client_id': client_id, 'output': output}, broadcast=True)

# Event handler for a client connecting
@socketio.on('connect')
def handle_connect():
    print("Client connected")

# Event handler for a client disconnecting
@socketio.on('disconnect')
def handle_disconnect():
    print("Client disconnected")

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
