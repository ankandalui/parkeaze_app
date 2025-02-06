import cv2
import torch
import numpy as np
from shapely.geometry import Polygon
import time
import socketio
sio = socketio.Client()
sio.connect('https://websocket-parking.onrender.com') 
client_id = 1

total_slots=5
prev_status=5

model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)

video_source = (0)
dw=640
dh=480

parking_slots = [
    # np.array([[250, 116], [169, 371], [519, 372], [464, 122]], dtype=np.int32).reshape((-1, 1, 2)),  
    np.array([[85, 116], [86, 202], [168, 195], [166, 111]], dtype=np.int32).reshape((-1, 1, 2)),  
    np.array([[235, 110], [240, 190], [335, 188], [333, 101]], dtype=np.int32).reshape((-1, 1, 2)),
    np.array([[405, 101], [413, 191], [512, 185], [506, 99]], dtype=np.int32).reshape((-1, 1, 2)), 
    # np.array([[542, 141], [593, 173], [630, 135], [591, 104]], dtype=np.int32).reshape((-1, 1, 2))    
]

def preprocess_image(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    # thresholded = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    median_blurred = cv2.medianBlur(blurred, 5)
    thresholded = cv2.adaptiveThreshold(median_blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    dilated = cv2.dilate(thresholded, np.ones((3, 3), np.uint8), iterations=1)
    # return thresholded
    return dilated

# Function to calculate the number of detected edges inside the slot polygon
def count_edges_in_polygon(image, polygon):
    processed_image = preprocess_image(image)
    mask = np.zeros(image.shape[:2], dtype=np.uint8)
    cv2.fillPoly(mask, [polygon], 255)
    masked_image = cv2.bitwise_and(processed_image, processed_image, mask=mask)
    return np.sum(masked_image > 0)  # Count non-zero pixels (edges)

# Function to calculate the intersection area between two polygons
def intersection_area(polygon1, polygon2):
    intersection = polygon1.intersection(polygon2)
    return intersection.area

# Function to process the video frame
def process_frame(frame):
    if frame is None:
        print("Error: Frame is None")
        return None, []
    
    # frame = cv2.resize(frame, (640, 480))

    # Convert BGR to RGB (YOLOv5 expects RGB format)
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Pass the RGB frame to the model
    results = model(frame_rgb)

    # Extract detections
    detections = results.xyxy[0].numpy()

    # slot_statuses = []
    slot_statuses =0

    for i, slot in enumerate(parking_slots):
        slot_polygon = Polygon([tuple(pt[0]) for pt in slot])
        slot_status = "Empty"
        

        for det in detections:
            x1, y1, x2, y2, conf, cls = det
            if cls == 2:  # Check for car class
                bbox_poly = Polygon([(x1, y1), (x2, y1), (x2, y2), (x1, y2)])

                if slot_polygon.intersects(bbox_poly):
                    inter_area = intersection_area(bbox_poly, slot_polygon)
                    edges_count = count_edges_in_polygon(frame, slot)
                    print(edges_count)

                    if not (inter_area < 0.4 * slot_polygon.area and edges_count > 1749.5):
                        slot_status = "Filled"
                        slot_statuses = slot_statuses+1
                        break

        # slot_statuses.append(f"Slot {i + 1}: {slot_status}")


        # Draw the polygon for each slot on the original frame
        color = (0, 255, 0) if slot_status == "Empty" else (0, 0, 255)
        cv2.polylines(frame, [slot], isClosed=True, color=color, thickness=2)

    return frame, (total_slots-slot_statuses)



cap = cv2.VideoCapture(video_source)

if not cap.isOpened():
    print("Error: Could not open video file.")
else:
    print("Video file opened successfully.")

def mouse_callback(event, x, y, flags, param):
    if event == cv2.EVENT_MOUSEMOVE:
        print(f"Coordinates: x={x}, y={y}")

# Set up window and mouse callback
cv2.namedWindow('Parking Lot Monitoring')
cv2.setMouseCallback('Parking Lot Monitoring', mouse_callback)

# cv2.namedWindow('Parking Lot Monitoring')

# Track the last detection time
last_detection_time = time.time()

# First detection
ret, frame = cap.read()

if ret:
    processed_frame, slot_statuses = process_frame(frame)
    # for status in slot_statuses:
    #     print(status)
    print(slot_statuses)
    if(prev_status!=slot_statuses):
        sio.emit('client_data', {'client_id': client_id, 'output': slot_statuses})
        # print(slot_statuses)
        prev_status= slot_statuses

while True:
    ret, frame = cap.read()

    if not ret:
        # print("Reached the end of the video or failed to read the frame.") 
        break
    frame=cv2.resize(frame,(dw,dh))

    # Perform detection every 3 seconds
    current_time = time.time()
    if current_time - last_detection_time >= 5:
        processed_frame, slot_statuses = process_frame(frame)
        last_detection_time = current_time

        # Print slot statuses in terminal
        # for status in slot_statuses:
        #     print(status)
        print(slot_statuses)
        if(prev_status!=slot_statuses):
            sio.emit('client_data', {'client_id': client_id, 'output': slot_statuses})
            print(slot_statuses)
            prev_status= slot_statuses
    
    cv2.imshow('Parking Lot Monitoring', processed_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
