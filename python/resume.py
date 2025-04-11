# # import cv2
# # import torch
# # import numpy as np
# # from shapely.geometry import Polygon
# # import time
# # import socketio
# # sio = socketio.Client()
# # sio.connect('http://127.0.0.1:5000') 
# # client_id = 1

# # total_slots=5
# # prev_status=5

# # model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)

# # video_source = ("http://192.168.137.165:8080/video")
# # dw=640
# # dh=480

# # parking_slots = [
# #     np.array([[309, 316], [381, 378], [277, 470], [212, 389]], dtype=np.int32).reshape((-1, 1, 2)),  
# #     np.array([[318, 309], [385, 370], [462, 300], [398, 248]], dtype=np.int32).reshape((-1, 1, 2)),  
# #     np.array([[407, 242], [469, 292], [536, 234], [478, 188]], dtype=np.int32).reshape((-1, 1, 2)),
# #     np.array([[484, 183], [539, 226], [587, 181], [533, 144]], dtype=np.int32).reshape((-1, 1, 2)), 
# #     np.array([[542, 141], [593, 173], [630, 135], [591, 104]], dtype=np.int32).reshape((-1, 1, 2))    
# # ]

# # def preprocess_image(image):
# #     gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
# #     blurred = cv2.GaussianBlur(gray, (5, 5), 0)
# #     # thresholded = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
# #     median_blurred = cv2.medianBlur(blurred, 5)
# #     thresholded = cv2.adaptiveThreshold(median_blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
# #     dilated = cv2.dilate(thresholded, np.ones((3, 3), np.uint8), iterations=1)
# #     # return thresholded
# #     return dilated

# # # Function to calculate the number of detected edges inside the slot polygon
# # def count_edges_in_polygon(image, polygon):
# #     processed_image = preprocess_image(image)
# #     mask = np.zeros(image.shape[:2], dtype=np.uint8)
# #     cv2.fillPoly(mask, [polygon], 255)
# #     masked_image = cv2.bitwise_and(processed_image, processed_image, mask=mask)
# #     return np.sum(masked_image > 0)  # Count non-zero pixels (edges)

# # # Function to calculate the intersection area between two polygons
# # def intersection_area(polygon1, polygon2):
# #     intersection = polygon1.intersection(polygon2)
# #     return intersection.area

# # # Function to process the video frame
# # def process_frame(frame):
# #     if frame is None:
# #         print("Error: Frame is None")
# #         return None, []
    
# #     # frame = cv2.resize(frame, (640, 480))

# #     # Convert BGR to RGB (YOLOv5 expects RGB format)
# #     frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

# #     # Pass the RGB frame to the model
# #     results = model(frame_rgb)

# #     # Extract detections
# #     detections = results.xyxy[0].numpy()

# #     # slot_statuses = []
# #     slot_statuses =0

# #     for i, slot in enumerate(parking_slots):
# #         slot_polygon = Polygon([tuple(pt[0]) for pt in slot])
# #         slot_status = "Empty"
        

# #         for det in detections:
# #             x1, y1, x2, y2, conf, cls = det
# #             if cls == 2:  # Check for car class
# #                 bbox_poly = Polygon([(x1, y1), (x2, y1), (x2, y2), (x1, y2)])

# #                 if slot_polygon.intersects(bbox_poly):
# #                     inter_area = intersection_area(bbox_poly, slot_polygon)
# #                     edges_count = count_edges_in_polygon(frame, slot)
# #                     print(edges_count)

# #                     if not (inter_area < 0.4 * slot_polygon.area and edges_count > 1749.5):
# #                         slot_status = "Filled"
# #                         slot_statuses = slot_statuses+1
# #                         break

# #         # slot_statuses.append(f"Slot {i + 1}: {slot_status}")


# #         # Draw the polygon for each slot on the original frame
# #         color = (0, 255, 0) if slot_status == "Empty" else (0, 0, 255)
# #         cv2.polylines(frame, [slot], isClosed=True, color=color, thickness=2)

# #     return frame, (total_slots-slot_statuses)



# # cap = cv2.VideoCapture(video_source)

# # if not cap.isOpened():
# #     print("Error: Could not open video file.")
# # else:
# #     print("Video file opened successfully.")

# # def mouse_callback(event, x, y, flags, param):
# #     if event == cv2.EVENT_MOUSEMOVE:
# #         print(f"Coordinates: x={x}, y={y}")

# # # Set up window and mouse callback
# # cv2.namedWindow('Parking Lot Monitoring')
# # cv2.setMouseCallback('Parking Lot Monitoring', mouse_callback)

# # # cv2.namedWindow('Parking Lot Monitoring')

# # # Track the last detection time
# # last_detection_time = time.time()

# # # First detection
# # ret, frame = cap.read()

# # if ret:
# #     processed_frame, slot_statuses = process_frame(frame)
# #     # for status in slot_statuses:
# #     #     print(status)
# #     print(slot_statuses)
# #     if(prev_status!=slot_statuses):
# #         sio.emit('client_data', {'client_id': client_id, 'output': slot_statuses})
# #         # print(slot_statuses)
# #         prev_status= slot_statuses

# # while True:
# #     ret, frame = cap.read()

# #     if not ret:
# #         # print("Reached the end of the video or failed to read the frame.") 
# #         break
# #     frame=cv2.resize(frame,(dw,dh))

# #     # Perform detection every 3 seconds
# #     current_time = time.time()
# #     if current_time - last_detection_time >= 5:
# #         processed_frame, slot_statuses = process_frame(frame)
# #         last_detection_time = current_time

# #         # Print slot statuses in terminal
# #         # for status in slot_statuses:
# #         #     print(status)
# #         print(slot_statuses)
# #         if(prev_status!=slot_statuses):
# #             sio.emit('client_data', {'client_id': client_id, 'output': slot_statuses})
# #             print(slot_statuses)
# #             prev_status= slot_statuses
    
# #     cv2.imshow('Parking Lot Monitoring', processed_frame)

# #     if cv2.waitKey(1) & 0xFF == ord('q'):
# #         break

# # cap.release()
# # cv2.destroyAllWindows()


# # import cv2
# # import torch
# # import numpy as np
# # from shapely.geometry import Polygon
# # import time
# # import socketio
# # import logging
# # from typing import Tuple, List, Optional

# # # Configure logging
# # logging.basicConfig(
# #     level=logging.INFO,
# #     format='%(asctime)s - %(levelname)s - %(message)s'
# # )
# # logger = logging.getLogger(__name__)

# # # Server Configuration
# # SERVER_URL = 'http://192.168.60.44:5000'  # Replace with your computer's IP
# # CLIENT_ID = 1
# # TOTAL_SLOTS = 5
# # DETECTION_INTERVAL = 5  # seconds

# # # Video Configuration
# # VIDEO_SOURCE = "http://192.168.60.110:8080/video"
# # DISPLAY_WIDTH = 640
# # DISPLAY_HEIGHT = 480

# # # Initialize Socket.IO client with reconnection settings
# # sio = socketio.Client(
# #     reconnection=True,
# #     reconnection_attempts=5,
# #     reconnection_delay=1,
# #     reconnection_delay_max=5,
# #     randomization_factor=0.5
# # )

# # # Socket.IO Event Handlers
# # @sio.event
# # def connect():
# #     logger.info(f"Connected to server at {SERVER_URL}")

# # @sio.event
# # def connect_error(error):
# #     logger.error(f"Connection error: {error}")

# # @sio.event
# # def disconnect():
# #     logger.info("Disconnected from server")

# # # Initialize YOLOv5 model
# # try:
# #     model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)
# #     logger.info("YOLOv5 model loaded successfully")
# # except Exception as e:
# #     logger.error(f"Failed to load YOLOv5 model: {e}")
# #     raise

# # # Parking slot coordinates
# # parking_slots = [
# #     np.array([[309, 316], [381, 378], [277, 470], [212, 389]], dtype=np.int32).reshape((-1, 1, 2)),  
# #     np.array([[318, 309], [385, 370], [462, 300], [398, 248]], dtype=np.int32).reshape((-1, 1, 2)),  
# #     np.array([[407, 242], [469, 292], [536, 234], [478, 188]], dtype=np.int32).reshape((-1, 1, 2)),
# #     np.array([[484, 183], [539, 226], [587, 181], [533, 144]], dtype=np.int32).reshape((-1, 1, 2)), 
# #     np.array([[542, 141], [593, 173], [630, 135], [591, 104]], dtype=np.int32).reshape((-1, 1, 2))    
# # ]

# # def preprocess_image(image: np.ndarray) -> np.ndarray:
# #     """Preprocess the image for edge detection."""
# #     gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
# #     blurred = cv2.GaussianBlur(gray, (5, 5), 0)
# #     median_blurred = cv2.medianBlur(blurred, 5)
# #     thresholded = cv2.adaptiveThreshold(
# #         median_blurred, 
# #         255, 
# #         cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
# #         cv2.THRESH_BINARY, 
# #         11, 
# #         2
# #     )
# #     dilated = cv2.dilate(thresholded, np.ones((3, 3), np.uint8), iterations=1)
# #     return dilated

# # def count_edges_in_polygon(image: np.ndarray, polygon: np.ndarray) -> int:
# #     """Calculate the number of detected edges inside the slot polygon."""
# #     processed_image = preprocess_image(image)
# #     mask = np.zeros(image.shape[:2], dtype=np.uint8)
# #     cv2.fillPoly(mask, [polygon], 255)
# #     masked_image = cv2.bitwise_and(processed_image, processed_image, mask=mask)
# #     return np.sum(masked_image > 0)

# # def intersection_area(polygon1: Polygon, polygon2: Polygon) -> float:
# #     """Calculate the intersection area between two polygons."""
# #     intersection = polygon1.intersection(polygon2)
# #     return intersection.area

# # def process_frame(frame: np.ndarray) -> Tuple[np.ndarray, int]:
# #     """Process a video frame and return the processed frame and available slots."""
# #     if frame is None:
# #         logger.error("Error: Frame is None")
# #         raise ValueError("Invalid frame")

# #     # Convert BGR to RGB for YOLOv5
# #     frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
# #     # Get detections
# #     results = model(frame_rgb)
# #     detections = results.xyxy[0].numpy()
    
# #     occupied_slots = 0

# #     for i, slot in enumerate(parking_slots):
# #         slot_polygon = Polygon([tuple(pt[0]) for pt in slot])
# #         slot_status = "Empty"

# #         for det in detections:
# #             x1, y1, x2, y2, conf, cls = det
# #             if cls == 2:  # Car class
# #                 bbox_poly = Polygon([(x1, y1), (x2, y1), (x2, y2), (x1, y2)])

# #                 if slot_polygon.intersects(bbox_poly):
# #                     inter_area = intersection_area(bbox_poly, slot_polygon)
# #                     edges_count = count_edges_in_polygon(frame, slot)
# #                     logger.debug(f"Slot {i+1} edges count: {edges_count}")

# #                     if not (inter_area < 0.4 * slot_polygon.area and edges_count > 1749.5):
# #                         slot_status = "Filled"
# #                         occupied_slots += 1
# #                         break

# #         # Draw the polygon
# #         color = (0, 255, 0) if slot_status == "Empty" else (0, 0, 255)
# #         cv2.polylines(frame, [slot], isClosed=True, color=color, thickness=2)

# #     available_slots = TOTAL_SLOTS - occupied_slots
# #     return frame, available_slots

# # def main():
# #     """Main function to run the parking detection system."""
# #     # Connect to Socket.IO server
# #     try:
# #         sio.connect(SERVER_URL)
# #     except Exception as e:
# #         logger.error(f"Failed to connect to server: {e}")
# #         return

# #     # Initialize video capture
# #     cap = cv2.VideoCapture(VIDEO_SOURCE)
# #     if not cap.isOpened():
# #         logger.error("Error: Could not open video source")
# #         return

# #     logger.info("Video capture initialized successfully")
    
# #     cv2.namedWindow('Parking Lot Monitoring')
# #     last_detection_time = time.time()
# #     prev_status = TOTAL_SLOTS

# #     try:
# #         while True:
# #             ret, frame = cap.read()
# #             if not ret:
# #                 logger.error("Failed to read frame")
# #                 break

# #             frame = cv2.resize(frame, (DISPLAY_WIDTH, DISPLAY_HEIGHT))
            
# #             # Process frame every DETECTION_INTERVAL seconds
# #             current_time = time.time()
# #             if current_time - last_detection_time >= DETECTION_INTERVAL:
# #                 processed_frame, available_slots = process_frame(frame)
# #                 last_detection_time = current_time
                
# #                 # Only emit if status has changed
# #                 if prev_status != available_slots:
# #                     try:
# #                         sio.emit('client_data', {
# #                             'client_id': CLIENT_ID, 
# #                             'output': available_slots
# #                         })
# #                         logger.info(f"Available slots: {available_slots}")
# #                         prev_status = available_slots
# #                     except Exception as e:
# #                         logger.error(f"Failed to emit data: {e}")

# #                 cv2.imshow('Parking Lot Monitoring', processed_frame)

# #             if cv2.waitKey(1) & 0xFF == ord('q'):
# #                 break

# #     except Exception as e:
# #         logger.error(f"An error occurred: {e}")
    
# #     finally:
# #         cap.release()
# #         cv2.destroyAllWindows()
# #         sio.disconnect()
# #         logger.info("Application shutdown complete")

# # if __name__ == "__main__":
# #     main()


# import cv2
# import torch
# import numpy as np
# from shapely.geometry import Polygon
# import time
# import socketio
# import logging
# from typing import Tuple, List, Optional

# # Configure logging
# logging.basicConfig(
#     level=logging.INFO,
#     format='%(asctime)s - %(levelname)s - %(message)s'
# )
# logger = logging.getLogger(__name__)

# # Server Configuration
# SERVER_URL = 'http://172.16.16.165:5000'  # Replace with your computer's IP
# CLIENT_ID = 1
# TOTAL_SLOTS = 5
# DETECTION_INTERVAL = 5  # seconds

# # Video Configuration
# VIDEO_SOURCE = "http://192.168.137.165:8080/video"  # Replace with your camera IP
# DISPLAY_WIDTH = 640
# DISPLAY_HEIGHT = 480

# # Initialize Socket.IO client
# sio = socketio.Client(
#     reconnection=True,
#     reconnection_attempts=5,
#     reconnection_delay=1
# )

# # Socket.IO Event Handlers
# @sio.event
# def connect():
#     logger.info(f"Connected to server at {SERVER_URL}")

# @sio.event
# def connect_error(error):
#     logger.error(f"Connection error: {error}")

# @sio.event
# def disconnect():
#     logger.info("Disconnected from server")

# # Initialize YOLOv5 model
# try:
#     model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)
#     logger.info("YOLOv5 model loaded successfully")
# except Exception as e:
#     logger.error(f"Failed to load YOLOv5 model: {e}")
#     raise

# # Parking slot coordinates - Adjust these according to your camera view
# parking_slots = [
#     np.array([[179, 171], [107, 260], [9, 215], [70, 136]], dtype=np.int32).reshape((-1, 1, 2)),  
#     np.array([[173, 165], [110, 258], [220, 298], [264, 194]], dtype=np.int32).reshape((-1, 1, 2)),  
#     np.array([[274, 196], [227, 299], [342, 337], [377, 225]], dtype=np.int32).reshape((-1, 1, 2)),
#     np.array([[382, 225], [346, 339], [483, 384], [505, 258]], dtype=np.int32).reshape((-1, 1, 2)), 
#     np.array([[508, 261], [487, 388], [633, 436], [630, 288]], dtype=np.int32).reshape((-1, 1, 2))    
# ]

# def preprocess_image(image: np.ndarray) -> np.ndarray:
#     """Preprocess the image for edge detection."""
#     gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
#     blurred = cv2.GaussianBlur(gray, (5, 5), 0)
#     median_blurred = cv2.medianBlur(blurred, 5)
#     thresholded = cv2.adaptiveThreshold(
#         median_blurred, 
#         255, 
#         cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
#         cv2.THRESH_BINARY, 
#         11, 
#         2
#     )
#     dilated = cv2.dilate(thresholded, np.ones((3, 3), np.uint8), iterations=1)
#     return dilated

# def count_edges_in_polygon(image: np.ndarray, polygon: np.ndarray) -> int:
#     """Calculate the number of detected edges inside the slot polygon."""
#     processed_image = preprocess_image(image)
#     mask = np.zeros(image.shape[:2], dtype=np.uint8)
#     cv2.fillPoly(mask, [polygon], 255)
#     masked_image = cv2.bitwise_and(processed_image, processed_image, mask=mask)
#     return np.sum(masked_image > 0)

# def intersection_area(polygon1: Polygon, polygon2: Polygon) -> float:
#     """Calculate the intersection area between two polygons."""
#     intersection = polygon1.intersection(polygon2)
#     return intersection.area

# def process_frame(frame: np.ndarray) -> Tuple[np.ndarray, int]:
#     """Process a video frame and return the processed frame and available slots count."""
#     if frame is None:
#         logger.error("Error: Frame is None")
#         raise ValueError("Invalid frame")

#     # Convert BGR to RGB for YOLOv5
#     frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
#     # Get detections
#     results = model(frame_rgb)
#     detections = results.xyxy[0].numpy()
    
#     # Initialize slot states (True = empty, False = occupied)
#     slot_states = [True] * TOTAL_SLOTS
#     occupied_count = 0

#     for i, slot in enumerate(parking_slots):
#         slot_polygon = Polygon([tuple(pt[0]) for pt in slot])
#         slot_status = "Empty"

#         for det in detections:
#             x1, y1, x2, y2, conf, cls = det
#             if cls == 2:  # Car class
#                 bbox_poly = Polygon([(x1, y1), (x2, y1), (x2, y2), (x1, y2)])

#                 if slot_polygon.intersects(bbox_poly):
#                     inter_area = intersection_area(bbox_poly, slot_polygon)
#                     edges_count = count_edges_in_polygon(frame, slot)

#                     if not (inter_area < 0.4 * slot_polygon.area and edges_count > 1749.5):
#                         slot_status = "Filled"
#                         occupied_count += 1
#                         slot_states[i] = False
#                         break

#         # Draw the polygon with slot number
#         color = (0, 255, 0) if slot_status == "Empty" else (0, 0, 255)
#         cv2.polylines(frame, [slot], isClosed=True, color=color, thickness=2)
        
#         # Add slot number
#         slot_center = np.mean(slot, axis=0).astype(int)[0]
#         cv2.putText(frame, str(i + 1), tuple(slot_center), 
#                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

#     # Calculate available spots
#     available_spots = TOTAL_SLOTS - occupied_count
#     return frame, available_spots

# def main():
#     """Main function to run the parking detection system."""
#     try:
#         sio.connect(SERVER_URL)
#     except Exception as e:
#         logger.error(f"Failed to connect to server: {e}")
#         return

#     cap = cv2.VideoCapture(VIDEO_SOURCE)
#     if not cap.isOpened():
#         logger.error("Error: Could not open video source")
#         return

#     logger.info("Video capture initialized successfully")
    
#     cv2.namedWindow('Parking Lot Monitoring')
#     last_detection_time = time.time()
#     prev_available_spots = TOTAL_SLOTS

#     try:
#         while True:
#             ret, frame = cap.read()
#             if not ret:
#                 logger.error("Failed to read frame")
#                 break

#             frame = cv2.resize(frame, (DISPLAY_WIDTH, DISPLAY_HEIGHT))
            
#             current_time = time.time()
#             if current_time - last_detection_time >= DETECTION_INTERVAL:
#                 processed_frame, available_spots = process_frame(frame)
#                 last_detection_time = current_time
                
#                 # Only emit if available spots count has changed
#                 if available_spots != prev_available_spots:
#                     try:
#                         sio.emit('client_data', {
#                             'client_id': CLIENT_ID,
#                             'output': available_spots  # Using old frontend format
#                         })
#                         logger.info(f"Available spots: {available_spots}")
#                         prev_available_spots = available_spots
#                     except Exception as e:
#                         logger.error(f"Failed to emit data: {e}")

#                 cv2.imshow('Parking Lot Monitoring', processed_frame)

#             if cv2.waitKey(1) & 0xFF == ord('q'):
#                 break

#     except Exception as e:
#         logger.error(f"An error occurred: {e}")
    
#     finally:
#         cap.release()
#         cv2.destroyAllWindows()
#         sio.disconnect()
#         logger.info("Application shutdown complete")

# if __name__ == "__main__":
#     main()

import cv2
import torch
import numpy as np
from shapely.geometry import Polygon
import time
import socketio
sio = socketio.Client()
sio.connect('http://192.168.182.44:5000') 
client_id = 1

total_slots=5
prev_status=5

model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)

video_source = ("http://192.168.182.225:8080/video")
dw=640
dh=480

parking_slots = [
    np.array([[68, 326], [190, 306], [200, 374], [73, 396]], dtype=np.int32).reshape((-1, 1, 2)),  
    np.array([[199, 303], [297, 286], [315, 348], [211, 372]], dtype=np.int32).reshape((-1, 1, 2)),  
    np.array([[315, 291], [394, 272], [419, 319], [325, 341]], dtype=np.int32).reshape((-1, 1, 2)),
    np.array([[412, 265], [496, 249], [521, 305], [427, 325]], dtype=np.int32).reshape((-1, 1, 2)), 
    np.array([[503, 253], [584, 234], [619, 287], [526, 304]], dtype=np.int32).reshape((-1, 1, 2))    
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

    slot_statusess = []
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

                    if not (inter_area < 0.2 * slot_polygon.area and edges_count > 1749.5):
                        slot_status = "Filled"
                        slot_statuses = slot_statuses+1
                        break

        slot_statusess.append(f"Slot {i + 1}: {slot_status}")
        print(slot_statusess)


        # Draw the polygon for each slot on the original frame
        color = (0, 255, 0) if slot_status == "Empty" else (0, 0, 255)
        cv2.polylines(frame, [slot], isClosed=True, color=color, thickness=2)

    return frame, slot_statusess



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
    if current_time - last_detection_time >= 3:
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