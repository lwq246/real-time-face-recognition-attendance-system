import pickle
import os
import cv2
import numpy as np
import albumentations as A
from albumentations.pytorch import ToTensorV2
from insightface.app import FaceAnalysis

# Initialize ArcFace feature extractor
app = FaceAnalysis(name='buffalo_l', providers=['CUDAExecutionProvider', 'CPUExecutionProvider'])
app.prepare(ctx_id=0)  # Set ctx_id=0 for CPU or change to GPU if available

# Load existing embeddings
embedding_file = "illumination_arc_face_embeddings.pkl"

# Initialize embeddings
if os.path.exists(embedding_file):
    with open(embedding_file, "rb") as f:
        data = pickle.load(f)
        X_train = list(data["X_train"])
        y_train = list(data["y_train"])
else:
    X_train = []
    y_train = []

# Preprocessing Functions
def apply_clahe(img):
    """Apply CLAHE to enhance contrast under poor lighting."""
    lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    lab = cv2.merge((l, a, b))
    return cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)

def gamma_correction(img, gamma=1.2):
    """Adjust image brightness adaptively."""
    inv_gamma = 1.0 / gamma
    table = np.array([(i / 255.0) ** inv_gamma * 255 for i in range(256)]).astype("uint8")
    return cv2.LUT(img, table)

def preprocess_image(img):
    """Apply both CLAHE and Gamma Correction."""
    img = apply_clahe(img)
    img = gamma_correction(img, gamma=1.2)
    return img

# Augmentation Pipeline
augmentor = A.Compose([
    A.HorizontalFlip(p=0.3),  # safer to lower flip chance
    A.RandomBrightnessContrast(brightness_limit=0.1, contrast_limit=0.1, p=0.3),
    A.ShiftScaleRotate(shift_limit=0.02, scale_limit=0.05, rotate_limit=10, p=0.3),  # milder shifts
    A.GaussianBlur(blur_limit=1, p=0.1),  # very light blur
    ToTensorV2()
])

def extract_embedding(img):
    """Extract face embedding from the preprocessed image."""
    faces = app.get(img)
    if len(faces) == 0:
        return None
    return faces[0].embedding

def augment_image(img):
    aug_embeddings = []
    augmented = augmentor(image=img)
    aug_img = augmented["image"].permute(1, 2, 0).numpy().astype(np.float32)
    embedding = extract_embedding(aug_img)
    if embedding is not None:
        aug_embeddings.append(embedding)
    return aug_embeddings

def add_person(name, images):
    """
    Process registration photos and add person to face embeddings
    Args:
        name: Student's name
        images: List of base64 encoded images from registration
    """
    print(f"✅ Processing registration photos for {name}...")
    new_embeddings = []
    
    for img_data in images:
        # Convert base64 to image
        img_bytes = np.frombuffer(img_data, dtype=np.uint8)
        img = cv2.imdecode(img_bytes, cv2.IMREAD_COLOR)
        
        if img is None:
            print(f"❌ Error: Unable to process image for {name}")
            continue

        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = preprocess_image(img)  # Apply lighting correction

        # Extract original embedding
        embedding = extract_embedding(img)
        if embedding is not None:
            new_embeddings.append(embedding)

        # Generate augmented embeddings
        new_embeddings.extend(augment_image(img))

    if new_embeddings:
        X_train.extend(new_embeddings)
        y_train.extend([name] * len(new_embeddings))
        
        # Save updated embeddings
        updated_data = {
            "X_train": np.array(X_train),
            "y_train": y_train
        }
        
        with open(embedding_file, "wb") as f:
            pickle.dump(updated_data, f)
            
        print(f"✅ Successfully added {len(new_embeddings)} embeddings for {name}")
        return True
    else:
        print(f"❌ No valid embeddings generated for {name}")
        return False

# Remove the __main__ block since this will be called from the registration endpoint