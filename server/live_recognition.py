# import cv2
# import numpy as np
# import pickle
# from insightface.app import FaceAnalysis
# from datetime import datetime
# import requests
# import time

# # Initialize face analysis
# face_analyzer = FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
# face_analyzer.prepare(ctx_id=0)

# # Load embeddings
# with open("illumination_arc_face_embeddings.pkl", "rb") as f:
#     data = pickle.load(f)
#     X_train = data["X_train"]
#     y_train = data["y_train"]

# def cosine_similarity(a, b):
#     return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# def predict_image(embedding, threshold=0.4):
#     best_match = None
#     best_score = -1

#     for i, stored_embedding in enumerate(X_train):
#         similarity = cosine_similarity(embedding, stored_embedding)
#         if similarity > best_score:
#             best_score = similarity
#             best_match = y_train[i]

#     if best_score >= threshold:
#         return best_match, float(best_score * 100)
#     else:
#         return "Unknown", float(best_score * 100)

# def main():
#     # Initialize camera
#     cap = cv2.VideoCapture(0)
#     last_recognition_time = {}  # Track last recognition time for each person

#     print("🎥 Starting live recognition...")
#     print("Press 'q' to quit")

#     while True:
#         ret, frame = cap.read()
#         if not ret:
#             break

#         # Process frame
#         img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#         faces = face_analyzer.get(img_rgb)

#         for face in faces:
#             bbox = face.bbox.astype(int)
#             embedding = face.embedding
#             name, confidence = predict_image(embedding)

#             # Draw rectangle around face
#             cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 255, 0), 2)
            
#             # Add text above the face rectangle
#             text = f"{name} ({confidence:.2f}%)"
#             cv2.putText(frame, text, (bbox[0], bbox[1] - 10), 
#                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

#             # Update attendance if confidence is high and not recently recorded
#             current_time = time.time()
#             if (name != "Unknown" and 
#                 confidence > 80 and 
#                 (name not in last_recognition_time or 
#                  current_time - last_recognition_time[name] > 60)):  # 60 seconds cooldown
                
#                 try:
#                     # Send attendance update to server
#                     response = requests.post("http://localhost:5000/attendance", json={
#                         "studentId": name,
#                         "date": datetime.now().strftime('%Y-%m-%d'),
#                         "status": "Present",
#                         "classId": "YOUR_CLASS_ID"  # Replace with actual class ID
#                     })
                    
#                     if response.status_code == 200:
#                         print(f"✅ Attendance marked for {name}")
#                         last_recognition_time[name] = current_time
#                     else:
#                         print(f"❌ Failed to mark attendance for {name}")
                        
#                 except Exception as e:
#                     print(f"❌ Error updating attendance: {e}")

#         # Display the frame
#         cv2.imshow("Live Face Recognition", frame)

#         # Break loop on 'q' press
#         if cv2.waitKey(1) & 0xFF == ord('q'):
#             break

#     # Cleanup
#     cap.release()
#     cv2.destroyAllWindows()

# if __name__ == "__main__":
#     main()