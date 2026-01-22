from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import pickle
import cupy as cp
from insightface.app import FaceAnalysis
import base64
from PIL import Image
import io
from datetime import datetime
from train_face_embeddings import add_person
import os
from sklearn.neighbors import KNeighborsClassifier
import joblib
import requests 
import albumentations as A
from albumentations.pytorch import ToTensorV2
import json

app = Flask(__name__)
CORS(app)

# Initialize face analysis with GPU support
face_analyzer = FaceAnalysis(name='buffalo_l', providers=['CUDAExecutionProvider', 'CPUExecutionProvider'])
face_analyzer.prepare(ctx_id=0)

# Load embeddings
with open("illumination_arc_face_embeddings.pkl", "rb") as f:
    data = pickle.load(f)
    X_train = data["X_train"]
    y_train = data["y_train"]

# Augmentation Pipeline
augmentor = A.Compose([
    A.HorizontalFlip(p=0.3),  # safer to lower flip chance
    A.RandomBrightnessContrast(brightness_limit=0.1, contrast_limit=0.1, p=0.3),
    A.ShiftScaleRotate(shift_limit=0.02, scale_limit=0.05, rotate_limit=10, p=0.3),  # milder shifts
    A.GaussianBlur(blur_limit=1, p=0.1),  # very light blur
    ToTensorV2()
])

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

def predict_image(embedding, threshold=0.8):
    best_match = None
    best_score = -1

    for i, stored_embedding in enumerate(X_train):
        similarity = cosine_similarity(embedding, stored_embedding)
        if similarity > best_score:
            best_score = similarity
            best_match = y_train[i]

    if best_score >= threshold:
        return best_match, float(best_score * 100)
    else:
        return "Unknown", float(best_score * 100)

def process_image(image_data):
    # Convert to cv2 format
    nparr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_rgb = preprocess_image(img_rgb)  # Apply CLAHE & Gamma Correction
    
    # Detect faces
    faces = face_analyzer.get(img_rgb)
    if not faces:
        return {"faces": []}
    
    # Process all detected faces
    detected_faces = []
    name_confidence = {}  # Track highest confidence for each name
    
    for face in faces:
        embedding = face.embedding
        bbox = face.bbox.astype(int)
        
        # Get prediction for each face
        name, confidence = predict_image(embedding)
        
        # Update highest confidence for each name
        if name != "Unknown":
            if name not in name_confidence or confidence > name_confidence[name]:
                name_confidence[name] = confidence
        
        detected_faces.append({
            "name": name,
            "confidence": confidence,
            "bbox": bbox.tolist()
        })
    
    # Create list of names with their highest confidence
    detected_names = [{"name": name, "confidence": conf} 
                     for name, conf in name_confidence.items()]
    
    return {
        "faces": detected_faces,
        "count": len(detected_faces),
        "detected_people": detected_names
    }

@app.route('/process-frame', methods=['POST'])
def process_frame():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    image_file = request.files['image']
    result = process_image(image_file.read())
    return jsonify(result)



@app.route('/attendance', methods=['POST'])
def update_attendance():
    try:
        data = request.json
        attendance = {
            'studentId': data['studentId'],
            'date': datetime.strptime(data['date'], '%Y-%m-%d'),
            'status': data['status'],
            'classId': data['classId'],
            'timestamp': datetime.now()
        }
        
        # Update attendance in MongoDB
        result = Attendance.update_one(
            {
                'studentId': attendance['studentId'],
                'date': attendance['date'],
                'classId': attendance['classId']
            },
            {'$set': attendance},
            upsert=True
        )
        
        return jsonify({'success': True, 'message': 'Attendance updated'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Update model paths
model_path = "face_recognition_knn_model.joblib"
temp_embeddings_path = "temp_embeddings.json"

# Initialize models and variables
knn_model = None

# Load KNN model if exists
try:
    with open(model_path, 'rb') as f:
        knn_model = pickle.load(f)
except FileNotFoundError:
    print(f"KNN model file not found at {model_path}. Will be created when first student is registered.")
except Exception as e:
    print(f"Error loading KNN model: {e}")

@app.route('/students/train', methods=['POST'])
def train_face():
    try:
        data = request.json
        studentId = data['studentId']
        images = data['images']
        
        # Process base64 images and get embeddings
        new_embeddings = []
        for img_data in images:
            if ',' in img_data:
                img_data = img_data.split(',')[1]
            img_bytes = base64.b64decode(img_data)
            
            # Process image and get embedding
            nparr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Apply preprocessing
            img_rgb = preprocess_image(img_rgb)
            
            # Apply augmentation and get multiple versions
            augmented_images = []
            
            augmented = augmentor(image=img_rgb)['image']
            augmented = augmented.numpy().transpose(1, 2, 0)  # Convert back to numpy array
            augmented_images.append(augmented)
            
            # Process original and augmented images
            all_images = [img_rgb] + augmented_images
            for processed_img in all_images:
                faces = face_analyzer.get(processed_img)
                if faces:
                    new_embeddings.append(faces[0].embedding)

        if new_embeddings:
            # Get all existing embeddings from database
            response = requests.get('http://localhost:5000/api/embeddings')
            if response.status_code != 200:
                raise Exception("Failed to fetch embeddings from database")
            
            data = response.json()
            all_embeddings = np.array(data['embeddings'])
            all_labels = np.array(data['labels'])
            
            # Add new embeddings
            all_embeddings = np.vstack([all_embeddings, new_embeddings]) if len(all_embeddings) > 0 else np.array(new_embeddings)
            all_labels = np.concatenate([all_labels, [studentId] * len(new_embeddings)]) if len(all_labels) > 0 else np.array([studentId] * len(new_embeddings))
            
            # Train KNN model with all embeddings
            global knn_model, X_train, y_train
            knn_model = KNeighborsClassifier(n_neighbors=9, metric='cosine', weights='distance')
            knn_model.fit(all_embeddings, all_labels)
            
            # Update global variables
            X_train = all_embeddings
            y_train = all_labels
            
            # Save model
            joblib.dump(knn_model, model_path)
            
            return jsonify({
                'success': True,
                'embeddings': [e.tolist() for e in new_embeddings],
                'message': 'Model trained successfully'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'No faces detected in the provided images'
            }), 400
            
    except Exception as e:
        print(f"Training error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/students/remove-embeddings', methods=['POST'])
def remove_embeddings():
    try:
        data = request.json
        name = data['name']
        
        # Load current embeddings
        with open("illumination_arc_face_embeddings.pkl", "rb") as f:
            data = pickle.load(f)
            X_train = list(data["X_train"])
            y_train = list(data["y_train"])
        
        # Remove all embeddings for this person
        indices = [i for i, y in enumerate(y_train) if y != name]
        X_train = [X_train[i] for i in indices]
        y_train = [y_train[i] for i in indices]
        
        # Save updated embeddings
        with open("illumination_arc_face_embeddings.pkl", "wb") as f:
            pickle.dump({"X_train": np.array(X_train), "y_train": y_train}, f)
            
        return jsonify({'success': True, 'message': 'Embeddings removed successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500



if __name__ == '__main__':
    app.run(port=5000)