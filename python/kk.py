# # import cv2
# # import math
# # import numpy as np
# # import heapq

# # def euclidean_distance(p1, p2):
# #     return round(math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2), 2)

# # coords_dict = {
# #     'A': (91, 38), 'B': (430, 36), 'C': (642, 40), 'D': (880, 32), 'E': (1111, 44), 
# #     'F': (1114, 180), 'G': (982, 180), 'H': (642, 179), 'I': (1052, 638), 'J': (422, 177), 
# #     'K': (89, 188), 'L': (97, 336), 'M': (338, 339), 'N': (654, 340), 'O': (718, 340), 
# #     'P': (983, 339), 'Q': (1051, 345), 'R': (1046, 495), 'S': (719, 500), 'T': (549, 507), 
# #     'U': (210, 504), 'V': (97, 501), 'W': (90, 654), 'X': (212, 652), 'Y': (542, 650), 'Z': (722, 656)
# # }

# # edges = [
# #     ('A', 'B'), ('A', 'K'), ('B', 'C'), ('B', 'J'), ('C', 'D'), ('C', 'H'), ('D', 'E'), ('E', 'F'),
# #     ('F', 'G'), ('G', 'H'), ('G', 'P'), ('H', 'N'), ('H', 'J'), ('K', 'L'), ('L', 'M'), ('M', 'N'),
# #     ('O', 'S'), ('P', 'Q'), ('R', 'S'), ('S', 'Z'), ('T', 'Y'), ('K', 'J'), ('L', 'V'), ('N', 'O'),
# #     ('O', 'P'), ('Q', 'R'), ('R', 'I'), ('S', 'T'), ('T', 'U'), ('U', 'X'), ('V', 'W'), ('X', 'Y'),
# #     ('Z', 'I'), ('U', 'V'), ('W', 'X'), ('Y', 'Z')
# # ]

# # graph = {node: [] for node in coords_dict}
# # for edge in edges:
# #     weight = euclidean_distance(coords_dict[edge[0]], coords_dict[edge[1]])
# #     graph[edge[0]].append((edge[1], weight))
# #     graph[edge[1]].append((edge[0], weight))

# # def dijkstra(graph, start, end):
# #     pq = [(0, start)]
# #     distances = {node: float('inf') for node in graph}
# #     distances[start] = 0
# #     previous = {}

# #     while pq:
# #         curr_dist, node = heapq.heappop(pq)
# #         if node == end:
# #             break
# #         for neighbor, weight in graph[node]:
# #             distance = curr_dist + weight
# #             if distance < distances[neighbor]:
# #                 distances[neighbor] = distance
# #                 previous[neighbor] = node
# #                 heapq.heappush(pq, (distance, neighbor))

# #     path, node = [], end
# #     while node in previous:
# #         path.append(node)
# #         node = previous[node]
# #     path.append(start)
# #     return path[::-1], distances[end]

# # def bellman_ford(graph, start, end):
# #     distances = {node: float('inf') for node in graph}
# #     distances[start] = 0
# #     previous = {}
    
# #     for _ in range(len(graph) - 1):
# #         for node in graph:
# #             for neighbor, weight in graph[node]:
# #                 if distances[node] + weight < distances[neighbor]:
# #                     distances[neighbor] = distances[node] + weight
# #                     previous[neighbor] = node

# #     path, node = [], end
# #     while node in previous:
# #         path.append(node)
# #         node = previous[node]
# #     path.append(start)
# #     return path[::-1], distances[end]

# # def mouse_callback(event, x, y, flags, param):
# #     global source, destination
# #     if event == cv2.EVENT_LBUTTONDOWN:
# #         for node, coord in coords_dict.items():
# #             if abs(coord[0] - x) < 10 and abs(coord[1] - y) < 10:
# #                 if source is None:
# #                     source = node
# #                     print(f"Source selected: {source}")
# #                 elif destination is None:
# #                     destination = node
# #                     print(f"Destination selected: {destination}")
# #                     find_and_draw_shortest_path()
# #                 break

# # def find_and_draw_shortest_path():
# #     global source, destination
# #     if source and destination:
# #         dijkstra_path, dijkstra_dist = dijkstra(graph, source, destination)
# #         bellman_path, bellman_dist = bellman_ford(graph, source, destination)
        
# #         print(f"Dijkstra's Path: {dijkstra_path}, Distance: {dijkstra_dist}")
# #         print(f"Bellman-Ford Path: {bellman_path}, Distance: {bellman_dist}")
        
# #         best_path = dijkstra_path if dijkstra_dist < bellman_dist else bellman_path
# #         for i in range(len(best_path) - 1):
# #             cv2.line(image, coords_dict[best_path[i]], coords_dict[best_path[i+1]], (0, 255, 0), 2)
# #         cv2.destroyAllWindows()
# #         cv2.imshow("Shortest Path", image)

# # source, destination = None, None
# # image_path = "IMG.png"
# # image = cv2.imread(image_path)
# # if image is None:
# #     print("Error: Could not load image.")
# #     exit()

# # cv2.imshow("Select Source and Destination", image)
# # cv2.setMouseCallback("Select Source and Destination", mouse_callback)
# # cv2.waitKey(0)
# # cv2.destroyAllWindows()


from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import math
import numpy as np
import heapq
import base64

app = Flask(__name__)
CORS(app)

def euclidean_distance(p1, p2):
    return round(math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2), 2)

coords_dict = {
    'A': (91, 38), 'B': (430, 36), 'C': (642, 40), 'D': (880, 32), 'E': (1111, 44), 
    'F': (1114, 180), 'G': (982, 180), 'H': (642, 179), 'I': (1052, 638), 'J': (422, 177), 
    'K': (89, 188), 'L': (97, 336), 'M': (338, 339), 'N': (654, 340), 'O': (718, 340), 
    'P': (983, 339), 'Q': (1051, 345), 'R': (1046, 495), 'S': (719, 500), 'T': (549, 507), 
    'U': (210, 504), 'V': (97, 501), 'W': (90, 654), 'X': (212, 652), 'Y': (542, 650), 'Z': (722, 656)
}

edges = [
    ('A', 'B'), ('A', 'K'), ('B', 'C'), ('B', 'J'), ('C', 'D'), ('C', 'H'), ('D', 'E'), ('E', 'F'),
    ('F', 'G'), ('G', 'H'), ('G', 'P'), ('H', 'N'), ('H', 'J'), ('K', 'L'), ('L', 'M'), ('M', 'N'),
    ('O', 'S'), ('P', 'Q'), ('R', 'S'), ('S', 'Z'), ('T', 'Y'), ('K', 'J'), ('L', 'V'), ('N', 'O'),
    ('O', 'P'), ('Q', 'R'), ('R', 'I'), ('S', 'T'), ('T', 'U'), ('U', 'X'), ('V', 'W'), ('X', 'Y'),
    ('Z', 'I'), ('U', 'V'), ('W', 'X'), ('Y', 'Z')
]

# Create graph
graph = {node: [] for node in coords_dict}
for edge in edges:
    weight = euclidean_distance(coords_dict[edge[0]], coords_dict[edge[1]])
    graph[edge[0]].append((edge[1], weight))
    graph[edge[1]].append((edge[0], weight))

def dijkstra(graph, start, end):
    pq = [(0, start)]
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    previous = {}

    while pq:
        curr_dist, node = heapq.heappop(pq)
        if node == end:
            break
        for neighbor, weight in graph[node]:
            distance = curr_dist + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                previous[neighbor] = node
                heapq.heappush(pq, (distance, neighbor))

    path, node = [], end
    while node in previous:
        path.append(node)
        node = previous[node]
    path.append(start)
    return path[::-1], distances[end]

def bellman_ford(graph, start, end):
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    previous = {}
    
    for _ in range(len(graph) - 1):
        for node in graph:
            for neighbor, weight in graph[node]:
                if distances[node] + weight < distances[neighbor]:
                    distances[neighbor] = distances[node] + weight
                    previous[neighbor] = node

    path, node = [], end
    while node in previous:
        path.append(node)
        node = previous[node]
    path.append(start)
    return path[::-1], distances[end]

@app.route('/calculate-path', methods=['POST'])
def calculate_path():
    data = request.json
    source = data.get('source')
    destination = data.get('destination')
    
    if not source or not destination:
        return jsonify({'error': 'Source and destination required'}), 400
        
    try:
        # Calculate paths using both algorithms
        dijkstra_path, dijkstra_dist = dijkstra(graph, source, destination)
        bellman_path, bellman_dist = bellman_ford(graph, source, destination)
        
        # Use the shorter path
        best_path = dijkstra_path if dijkstra_dist < bellman_dist else bellman_path
        best_distance = min(dijkstra_dist, bellman_dist)
        
        # Load and draw path on image
        image = cv2.imread("IMG.png")
        if image is None:
            return jsonify({'error': 'Failed to load image'}), 500
            
        # Draw nodes
        for node, coord in coords_dict.items():
            cv2.circle(image, coord, 5, (0, 0, 255), -1)  # Red circles for nodes
            cv2.putText(image, node, (coord[0]-10, coord[1]-10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

        # Draw path
        for i in range(len(best_path) - 1):
            start_point = coords_dict[best_path[i]]
            end_point = coords_dict[best_path[i+1]]
            cv2.line(image, start_point, end_point, (0, 255, 0), 2)  # Green lines for path
            
        # Highlight source and destination
        cv2.circle(image, coords_dict[source], 8, (255, 0, 0), -1)  # Blue circle for source
        cv2.circle(image, coords_dict[destination], 8, (0, 255, 255), -1)  # Yellow circle for destination
        
        # Convert image to base64
        _, buffer = cv2.imencode('.png', image)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return jsonify({
            'path': best_path,
            'distance': best_distance,
            'image': img_base64
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get-nodes', methods=['GET'])
def get_nodes():
    return jsonify({
        'nodes': list(coords_dict.keys()),
        'edges': edges,
        'coordinates': coords_dict
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import cv2
# import math
# import numpy as np
# import heapq
# import base64
# import speech_recognition as sr
# import pyttsx3

# app = Flask(__name__)
# CORS(app)

# # Voice recognition functions
# def listen_and_convert():
#     recognizer = sr.Recognizer()
    
#     with sr.Microphone() as source:
#         print("🎤 Listening... Speak now.")
#         recognizer.adjust_for_ambient_noise(source)
#         try:
#             audio = recognizer.listen(source, timeout=5)
#             text = recognizer.recognize_google(audio)
#             print("✅ Recognized Speech:", text)
#             return text
#         except sr.UnknownValueError:
#             print("❌ Could not understand audio.")
#         except sr.RequestError:
#             print("❌ API unavailable.")
#         except Exception as e:
#             print(f"⚠ Error: {e}")
    
#     return None

# # Path finding functions and data
# def euclidean_distance(p1, p2):
#     return round(math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2), 2)

# coords_dict = {
#     'A': (91, 38), 'B': (430, 36), 'C': (642, 40), 'D': (880, 32), 'E': (1111, 44), 
#     'F': (1114, 180), 'G': (982, 180), 'H': (642, 179), 'I': (1052, 638), 'J': (422, 177), 
#     'K': (89, 188), 'L': (97, 336), 'M': (338, 339), 'N': (654, 340), 'O': (718, 340), 
#     'P': (983, 339), 'Q': (1051, 345), 'R': (1046, 495), 'S': (719, 500), 'T': (549, 507), 
#     'U': (210, 504), 'V': (97, 501), 'W': (90, 654), 'X': (212, 652), 'Y': (542, 650), 'Z': (722, 656)
# }

# edges = [
#     ('A', 'B'), ('A', 'K'), ('B', 'C'), ('B', 'J'), ('C', 'D'), ('C', 'H'), ('D', 'E'), ('E', 'F'),
#     ('F', 'G'), ('G', 'H'), ('G', 'P'), ('H', 'N'), ('H', 'J'), ('K', 'L'), ('L', 'M'), ('M', 'N'),
#     ('O', 'S'), ('P', 'Q'), ('R', 'S'), ('S', 'Z'), ('T', 'Y'), ('K', 'J'), ('L', 'V'), ('N', 'O'),
#     ('O', 'P'), ('Q', 'R'), ('R', 'I'), ('S', 'T'), ('T', 'U'), ('U', 'X'), ('V', 'W'), ('X', 'Y'),
#     ('Z', 'I'), ('U', 'V'), ('W', 'X'), ('Y', 'Z')
# ]

# # Create graph
# graph = {node: [] for node in coords_dict}
# for edge in edges:
#     weight = euclidean_distance(coords_dict[edge[0]], coords_dict[edge[1]])
#     graph[edge[0]].append((edge[1], weight))
#     graph[edge[1]].append((edge[0], weight))

# def dijkstra(graph, start, end):
#     pq = [(0, start)]
#     distances = {node: float('inf') for node in graph}
#     distances[start] = 0
#     previous = {}

#     while pq:
#         curr_dist, node = heapq.heappop(pq)
#         if node == end:
#             break
#         for neighbor, weight in graph[node]:
#             distance = curr_dist + weight
#             if distance < distances[neighbor]:
#                 distances[neighbor] = distance
#                 previous[neighbor] = node
#                 heapq.heappush(pq, (distance, neighbor))

#     path, node = [], end
#     while node in previous:
#         path.append(node)
#         node = previous[node]
#     path.append(start)
#     return path[::-1], distances[end]

# def bellman_ford(graph, start, end):
#     distances = {node: float('inf') for node in graph}
#     distances[start] = 0
#     previous = {}
    
#     for _ in range(len(graph) - 1):
#         for node in graph:
#             for neighbor, weight in graph[node]:
#                 if distances[node] + weight < distances[neighbor]:
#                     distances[neighbor] = distances[node] + weight
#                     previous[neighbor] = node

#     path, node = [], end
#     while node in previous:
#         path.append(node)
#         node = previous[node]
#     path.append(start)
#     return path[::-1], distances[end]

# # API Endpoints
# @app.route('/calculate-path', methods=['POST'])
# def calculate_path():
#     data = request.json
#     source = data.get('source')
#     destination = data.get('destination')
    
#     if not source or not destination:
#         return jsonify({'error': 'Source and destination required'}), 400
        
#     try:
#         # Calculate paths using both algorithms
#         dijkstra_path, dijkstra_dist = dijkstra(graph, source, destination)
#         bellman_path, bellman_dist = bellman_ford(graph, source, destination)
        
#         # Use the shorter path
#         best_path = dijkstra_path if dijkstra_dist < bellman_dist else bellman_path
#         best_distance = min(dijkstra_dist, bellman_dist)
        
#         # Load and draw path on image
#         image = cv2.imread("IMG.png")
#         if image is None:
#             return jsonify({'error': 'Failed to load image'}), 500
            
#         # Draw nodes
#         for node, coord in coords_dict.items():
#             cv2.circle(image, coord, 5, (0, 0, 255), -1)  # Red circles for nodes
#             cv2.putText(image, node, (coord[0]-10, coord[1]-10), 
#                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

#         # Draw path
#         for i in range(len(best_path) - 1):
#             start_point = coords_dict[best_path[i]]
#             end_point = coords_dict[best_path[i+1]]
#             cv2.line(image, start_point, end_point, (0, 255, 0), 2)  # Green lines for path
            
#         # Highlight source and destination
#         cv2.circle(image, coords_dict[source], 8, (255, 0, 0), -1)  # Blue circle for source
#         cv2.circle(image, coords_dict[destination], 8, (0, 255, 255), -1)  # Yellow circle for destination
        
#         # Convert image to base64
#         _, buffer = cv2.imencode('.png', image)
#         img_base64 = base64.b64encode(buffer).decode('utf-8')
        
#         return jsonify({
#             'path': best_path,
#             'distance': best_distance,
#             'image': img_base64
#         })
        
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

# @app.route('/get-nodes', methods=['GET'])
# def get_nodes():
#     return jsonify({
#         'nodes': list(coords_dict.keys()),
#         'coordinates': coords_dict
#     })

# @app.route('/listen', methods=['GET'])
# def handle_voice_command():
#     text = listen_and_convert()
#     if text:
#         # Check for navigation commands
#         text = text.lower()
#         if 'next' in text or 'direction' in text:
#             return jsonify({
#                 'success': True,
#                 'command': 'next_direction',
#                 'text': text
#             })
        
#         return jsonify({
#             'success': True,
#             'command': 'unknown',
#             'text': text
#         })
    
#     return jsonify({
#         'success': False,
#         'error': 'Could not recognize speech'
#     })

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000, debug=True)

# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import cv2
# import math
# import numpy as np
# import heapq
# import base64
# import speech_recognition as sr
# import pyttsx3

# app = Flask(__name__)
# CORS(app)

# # Voice recognition functions
# def listen_and_convert():
#     recognizer = sr.Recognizer()
    
#     try:
#         with sr.Microphone() as source:
#             print("🎤 Listening... Speak now.")
#             recognizer.adjust_for_ambient_noise(source)
#             try:
#                 audio = recognizer.listen(source, timeout=5)
#                 text = recognizer.recognize_google(audio)
#                 print("✅ Recognized Speech:", text)
#                 return text
#             except sr.UnknownValueError:
#                 print("❌ Could not understand audio.")
#             except sr.RequestError:
#                 print("❌ API unavailable.")
#             except Exception as e:
#                 print(f"⚠ Error: {e}")
        
#         return None
#     except AttributeError:
#         print("❌ PyAudio not installed or microphone not available")
#         raise

# # Path finding functions and data
# def euclidean_distance(p1, p2):
#     return round(math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2), 2)

# coords_dict = {
#     'A': (91, 38), 'B': (430, 36), 'C': (642, 40), 'D': (880, 32), 'E': (1111, 44), 
#     'F': (1114, 180), 'G': (982, 180), 'H': (642, 179), 'I': (1052, 638), 'J': (422, 177), 
#     'K': (89, 188), 'L': (97, 336), 'M': (338, 339), 'N': (654, 340), 'O': (718, 340), 
#     'P': (983, 339), 'Q': (1051, 345), 'R': (1046, 495), 'S': (719, 500), 'T': (549, 507), 
#     'U': (210, 504), 'V': (97, 501), 'W': (90, 654), 'X': (212, 652), 'Y': (542, 650), 'Z': (722, 656)
# }

# edges = [
#     ('A', 'B'), ('A', 'K'), ('B', 'C'), ('B', 'J'), ('C', 'D'), ('C', 'H'), ('D', 'E'), ('E', 'F'),
#     ('F', 'G'), ('G', 'H'), ('G', 'P'), ('H', 'N'), ('H', 'J'), ('K', 'L'), ('L', 'M'), ('M', 'N'),
#     ('O', 'S'), ('P', 'Q'), ('R', 'S'), ('S', 'Z'), ('T', 'Y'), ('K', 'J'), ('L', 'V'), ('N', 'O'),
#     ('O', 'P'), ('Q', 'R'), ('R', 'I'), ('S', 'T'), ('T', 'U'), ('U', 'X'), ('V', 'W'), ('X', 'Y'),
#     ('Z', 'I'), ('U', 'V'), ('W', 'X'), ('Y', 'Z')
# ]

# # Create graph
# graph = {node: [] for node in coords_dict}
# for edge in edges:
#     weight = euclidean_distance(coords_dict[edge[0]], coords_dict[edge[1]])
#     graph[edge[0]].append((edge[1], weight))
#     graph[edge[1]].append((edge[0], weight))

# def dijkstra(graph, start, end):
#     try:
#         pq = [(0, start)]
#         distances = {node: float('inf') for node in graph}
#         distances[start] = 0
#         previous = {}

#         while pq:
#             curr_dist, node = heapq.heappop(pq)
#             if node == end:
#                 break
#             for neighbor, weight in graph[node]:
#                 distance = curr_dist + weight
#                 if distance < distances[neighbor]:
#                     distances[neighbor] = distance
#                     previous[neighbor] = node
#                     heapq.heappush(pq, (distance, neighbor))

#         path, node = [], end
#         while node in previous:
#             path.append(node)
#             node = previous[node]
#         path.append(start)
#         return path[::-1], distances[end]
#     except Exception as e:
#         print(f"Error in Dijkstra's algorithm: {e}")
#         raise

# def bellman_ford(graph, start, end):
#     try:
#         distances = {node: float('inf') for node in graph}
#         distances[start] = 0
#         previous = {}
        
#         for _ in range(len(graph) - 1):
#             for node in graph:
#                 for neighbor, weight in graph[node]:
#                     if distances[node] + weight < distances[neighbor]:
#                         distances[neighbor] = distances[node] + weight
#                         previous[neighbor] = node

#         path, node = [], end
#         while node in previous:
#             path.append(node)
#             node = previous[node]
#         path.append(start)
#         return path[::-1], distances[end]
#     except Exception as e:
#         print(f"Error in Bellman-Ford algorithm: {e}")
#         raise

# # API Endpoints
# @app.route('/calculate-path', methods=['POST'])
# def calculate_path():
#     try:
#         data = request.json
#         if not data:
#             return jsonify({'error': 'No JSON data received'}), 400
            
#         source = data.get('source')
#         destination = data.get('destination')
        
#         if not source or not destination:
#             return jsonify({'error': 'Source and destination required'}), 400
            
#         # Calculate paths using both algorithms
#         dijkstra_path, dijkstra_dist = dijkstra(graph, source, destination)
#         bellman_path, bellman_dist = bellman_ford(graph, source, destination)
        
#         # Use the shorter path
#         best_path = dijkstra_path if dijkstra_dist < bellman_dist else bellman_path
#         best_distance = min(dijkstra_dist, bellman_dist)
        
#         # Load and draw path on image
#         image = cv2.imread("IMG.png")
#         if image is None:
#             return jsonify({'error': 'Failed to load image'}), 500
            
#         # Draw nodes
#         for node, coord in coords_dict.items():
#             cv2.circle(image, coord, 5, (0, 0, 255), -1)  # Red circles for nodes
#             cv2.putText(image, node, (coord[0]-10, coord[1]-10), 
#                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

#         # Draw path
#         for i in range(len(best_path) - 1):
#             start_point = coords_dict[best_path[i]]
#             end_point = coords_dict[best_path[i+1]]
#             cv2.line(image, start_point, end_point, (0, 255, 0), 2)  # Green lines for path
            
#         # Highlight source and destination
#         cv2.circle(image, coords_dict[source], 8, (255, 0, 0), -1)  # Blue circle for source
#         cv2.circle(image, coords_dict[destination], 8, (0, 255, 255), -1)  # Yellow circle for destination
        
#         # Convert image to base64
#         _, buffer = cv2.imencode('.png', image)
#         img_base64 = base64.b64encode(buffer).decode('utf-8')
        
#         return jsonify({
#             'path': best_path,
#             'distance': best_distance,
#             'image': img_base64
#         })
        
#     except Exception as e:
#         print(f"Error in calculate_path: {e}")
#         return jsonify({'error': str(e)}), 500

# @app.route('/get-nodes', methods=['GET'])
# def get_nodes():
#     try:
#         return jsonify({
#             'nodes': list(coords_dict.keys()),
#             'coordinates': coords_dict
#         })
#     except Exception as e:
#         print(f"Error in get_nodes: {e}")
#         return jsonify({'error': str(e)}), 500

# @app.route('/listen', methods=['GET'])
# def handle_voice_command():
#     try:
#         text = listen_and_convert()
#         if text:
#             # Check for navigation commands
#             text = text.lower()
#             if 'next' in text or 'direction' in text:
#                 return jsonify({
#                     'success': True,
#                     'command': 'next_direction',
#                     'text': text
#                 })
            
#             return jsonify({
#                 'success': True,
#                 'command': 'unknown',
#                 'text': text
#             })
        
#         return jsonify({
#             'success': False,
#             'error': 'Could not recognize speech'
#         })
#     except AttributeError as e:
#         # Handle PyAudio not found error
#         print(f"PyAudio error: {e}")
#         return jsonify({
#             'success': False,
#             'error': 'Speech recognition system not available: PyAudio not installed'
#         }), 503
#     except Exception as e:
#         # Handle other errors
#         print(f"Error in handle_voice_command: {e}")
#         return jsonify({
#             'success': False,
#             'error': str(e)
#         }), 500

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000, debug=True)