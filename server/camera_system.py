import cv2
import numpy as np
import pickle
import cupy as cp
from insightface.app import FaceAnalysis
import requests
import time
import sys
from datetime import datetime, date
import joblib
# python server/camera_system.py "Room A101"
# Load saved embeddings
embedding_file = r"C:/Users/User/OneDrive/Documents/FYP/main_system/my-app/server/illumination_arc_face_embeddings.pkl"
with open(embedding_file, "rb") as f:
    data = pickle.load(f)
    X_train, y_train = data["X_train"], data["y_train"]

# Initialize ArcFace feature extractor
app = FaceAnalysis(name='buffalo_l', providers=['CUDAExecutionProvider', 'CPUExecutionProvider'])
app.prepare(ctx_id=0)

# Preprocessing Functions
def apply_clahe(img):
    lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    lab = cv2.merge((l, a, b))
    return cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)

def gamma_correction(img, gamma=1.2):
    inv_gamma = 1.0 / gamma
    table = np.array([(i / 255.0) ** inv_gamma * 255 for i in range(256)]).astype("uint8")
    return cv2.LUT(img, table)

def preprocess_image(img):
    img = apply_clahe(img)
    img = gamma_correction(img, gamma=1.2)
    return img

knn_model_file = "face_recognition_knn_model.joblib"
knn_model = joblib.load(knn_model_file)

# ✅ Face Recognition using KNN
def predict_image(embedding, threshold=0.8):
    probabilities = knn_model.predict_proba([embedding])[0]
    max_prob = max(probabilities)
    predicted_label = knn_model.classes_[np.argmax(probabilities)]

    if max_prob >= threshold:
        return predicted_label, max_prob * 100
    else:
        return "Unknown", max_prob * 100



# Attendance tracking dictionary


# Start Live Webcam
if len(sys.argv) != 3:
    print("Usage: python camera_system.py <location> <camera_index>")
    print("Example: python camera_system.py 'Room A101' 0")
    sys.exit(1)

CURRENT_LOCATION = sys.argv[1]
CAMERA_INDEX = int(sys.argv[2])

# Update the VideoCapture initialization
cap = cv2.VideoCapture(CAMERA_INDEX)
print(f"Camera system started with camera {CAMERA_INDEX}. Press 'q' to quit.")

# Add this after other initializations
marked_attendance = set()  # Store student names who have been marked for current class
current_class_id = None   # Track current class ID

def get_active_class():
    try:
        global current_class_id
        current_date = date.today().strftime('%Y-%m-%d')
        response = requests.get(f'http://localhost:5000/class/location/{CURRENT_LOCATION}/{current_date}')
        if response.status_code == 200:
            class_data = response.json()['class']
            
            # Only clear attendance set if class has changed
            if current_class_id != class_data['_id']:
                print(f"New class detected: {class_data['moduleCode']} in {CURRENT_LOCATION}")
                marked_attendance.clear()
                current_class_id = class_data['_id']
            
            return class_data
        return None
    except Exception as e:
        print(f"Error checking for active class: {e}")
        return None

while True:
    ret, frame = cap.read()
    if not ret:
        break

    img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    img_rgb = preprocess_image(img_rgb)
    faces = app.get(img_rgb)
    current_time = time.time()

    for face in faces:
        bbox = face.bbox.astype(int)
        embedding = face.embedding

        label, confidence = predict_image(embedding)
        text = f"{label} ({confidence:.2f}%)"

        # Draw bounding box and label
        cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 255, 0), 2)
        cv2.putText(frame, text, (bbox[0], bbox[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        # Update attendance if confidence is high
        if confidence > 40 and label != "Unknown":
            # Check for active class every time we detect a valid face
            current_class = get_active_class()
            if not current_class:
                continue

            # Skip if already marked attendance for this student in current class
            attendance_key = f"{label}_{current_class['_id']}"
            if attendance_key in marked_attendance:
                continue

            try:
                # First, get student's MongoDB ID
                student_response = requests.get(f'http://localhost:5000/student/id/{label}')
                if student_response.status_code == 200:
                    student_id = student_response.json()['studentId']
                    
                    # Mark attendance
                    # Update the attendance marking section
                    # No need to get MongoDB ID separately since label is now studentID
                    response = requests.post(
                        'http://localhost:5000/attendance/camera',
                        json={
                            'studentId': student_id,  # label is now the studentID
                            'date': date.today().strftime('%Y-%m-%d'),
                            'classId': current_class['_id']
                        }
                    )
                    # # Mark attendance
                    # response = requests.post(
                    #     'http://localhost:5000/attendance',
                    #     json={
                    #         'studentId': student_id,
                    #         'date': date.today().strftime('%Y-%m-%d'),
                    #         'status': 'Present',
                    #         'classId': current_class['_id']
                    #     }
                    # )
                    if response.status_code == 200:
                        print(f"Attendance marked for {label}")
                        marked_attendance.add(attendance_key)  # Add to marked set
                    else:
                        print(f"❌ Failed to mark attendance for {label}")
                else:
                    print(f"❌ Student {label} not found in database")
                    
            except Exception as e:
                print(f"❌ Error updating attendance: {e}")

    cv2.imshow("Live Face Recognition", frame)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()