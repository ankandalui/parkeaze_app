# app.py
from flask import Flask
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize SocketIO with CORS settings
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode='threading',
    logger=True,
    engineio_logger=True
)

# Dictionary to store the latest output from each client
client_data = {}

@app.route('/')
def index():
    return "Socket.IO Server is running"

@socketio.on('client_data')
def handle_client_data(data):
    try:
        client_id = data['client_id']
        output = data['output']
        
        # Update the client data dictionary
        client_data[client_id] = output
        
        # Log the data received from the client
        logger.info(f"Received data from Client {client_id}: {output}")
        
        # Broadcast the data to all connected clients
        emit('update_data', {
            'client_id': client_id,
            'output': output
        }, broadcast=True)
        
    except Exception as e:
        logger.error(f"Error handling client data: {str(e)}")
        emit('error', {'message': str(e)})

@socketio.on('connect')
def handle_connect():
    logger.info("Client connected")
    emit('connection_status', {'status': 'connected'})

@socketio.on('disconnect')
def handle_disconnect():
    logger.info("Client disconnected")

if __name__ == '__main__':
    try:
        # Log the server URLs
        logger.info("Starting server on:")
        logger.info("- Local: http://127.0.0.1:5000")
        logger.info("- Network: http://192.168.182.44:5000")  # Your computer's IP
        
        socketio.run(
            app,
            host='0.0.0.0',  # Bind to all interfaces
            port=5000,
            debug=True,
            use_reloader=False,
            log_output=True
        )
    except Exception as e:
        logger.error(f"Failed to start server: {str(e)}")