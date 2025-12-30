import os
import uuid
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io

app = FastAPI()

# Enable CORS so your Node.js server can talk to this
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Load the model (Update path to match your folder)
MODEL_PATH = "plant_disease_recog_model_pwp.keras"
model = tf.keras.models.load_model(MODEL_PATH)

# 2. Use the exact labels from the original creator
LABELS = [
    'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
    'Background_without_leaves', 'Blueberry___healthy', 'Cherry___Powdery_mildew', 'Cherry___healthy',
    'Corn___Cercospora_leaf_spot Gray_leaf_spot', 'Corn___Common_rust', 'Corn___Northern_Leaf_Blight', 'Corn___healthy',
    'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot', 'Peach___healthy',
    'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy', 'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy',
    'Raspberry___healthy', 'Soybean___healthy', 'Squash___Powdery_mildew', 'Strawberry___Leaf_scorch', 'Strawberry___healthy',
    'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold', 'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites Two-spotted_spider_mite', 'Tomato___Target_Spot', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus', 'Tomato___healthy'
]

def preprocess_image(image_bytes):
    # The original model used (160, 160) - THIS IS CRITICAL
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB').resize((160, 160))
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    # If the original creator normalized the data (/255), uncomment the next line:
    # img_array = img_array / 255.0
    return img_array

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # Read image
        contents = await file.read()
        features = preprocess_image(contents)
        
        # Predict
        predictions = model.predict(features)
        class_idx = np.argmax(predictions[0])
        confidence = float(np.max(predictions[0]))
        
        return {
            "disease": LABELS[class_idx],
            "confidence": confidence
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)