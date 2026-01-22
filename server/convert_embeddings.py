import pickle
import json

# Load pickle file
with open(r"C:/Users/User/OneDrive/Documents/FYP/main_system/my-app/server/illumination_arc_face_embeddings.pkl", "rb") as f:
    data = pickle.load(f)

# Convert to dictionary with student IDs as keys
embeddings_dict = {}
unique_names = set(data["y_train"])

for name in unique_names:
    formatted_name = name.replace(' ', '_').replace('-', '_')
    embeddings_dict[formatted_name] = []
    
    # Get all embeddings for this person
    for i, label in enumerate(data["y_train"]):
        if label == name:
            embeddings_dict[formatted_name].append(data["X_train"][i].tolist())

# Save as JSON
with open(r"C:/Users/User/OneDrive/Documents/FYP/main_system/my-app/server/embeddings.json", "w") as f:
    json.dump(embeddings_dict, f)

# Print verification
print("Conversion completed! Sample of processed names and their embedding counts:")
for i, (name, embeddings) in enumerate(embeddings_dict.items()):
    if i < 5:  # Show first 5 entries
        print(f"- {name}: {len(embeddings)} embeddings")