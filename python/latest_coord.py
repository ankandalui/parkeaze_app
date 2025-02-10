import cv2
import numpy as np


coords = []
all_lines = []

dw=640
dh=480

# Mouse callback function to capture the clicked coordinates
def click_event(event, x, y, flags, param):
    global coords, all_lines

    if event == cv2.EVENT_LBUTTONDOWN:  # Left mouse button click
        # Add the coordinates to the list
        coords.append([x, y])
        print(f"Point clicked: [{x}, {y}]")

        # Draw lines between consecutive points
        if len(coords) > 1:
            all_lines.append((coords[-2], coords[-1]))

        # If 4 points are collected, close the polygon
        if len(coords) == 4:
            all_lines.append((coords[-1], coords[0]))  # Close the polygon
            print(f"Polygon coordinates: {coords}")  # Print the coordinates in the required format
            coords = []  # Reset for the next polygon

# Function to redraw all lines
def redraw_lines(frame):
    global all_lines
    # Draw all lines
    for line in all_lines:
        cv2.line(frame, tuple(line[0]), tuple(line[1]), (255, 0, 0), 2)

# Start capturing video
cap = cv2.VideoCapture("http://192.168.137.165:8080/video")  # Use 0 for the webcam feed

if not cap.isOpened():
    print("Error: Could not open video stream.")
    exit()

while True:
    ret, frame = cap.read()  # Capture new frame from the video feed

    if not ret:
        print("Error: Failed to capture image.")
        break

    frame=cv2.resize(frame,(dw,dh))

    # Redraw the lines on the current frame
    redraw_lines(frame)

    # Display the updated frame with the drawn lines
    cv2.imshow("Video Feed", frame)

    # Set the mouse callback for the window
    cv2.setMouseCallback("Video Feed", click_event)

    # Handle key events
    key = cv2.waitKey(1) & 0xFF

    if key == ord('q'):  # Quit when 'q' is pressed
        break
    elif key == ord('d') and all_lines:  # Delete last line when 'd' is pressed
        if len(all_lines) > 4:  # Ensure there's enough data to pop
            all_lines.pop()  # Remove the last line
            coords = [line[0] for line in all_lines]  # Update coordinates list based on remaining lines

# Release the video capture and close windows
cap.release()
cv2.destroyAllWindows()



