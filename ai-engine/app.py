import os
import numpy as np
import io
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

# 1. CRITICAL Optimization: Disable heavy features before importing TF
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0' 

import tensorflow as tf

# Force TensorFlow to use only CPU and minimal RAM
tf.config.set_visible_devices([], 'GPU')

app = FastAPI(redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

MODEL_PATH = "plant_disease_recog_model_pwp.keras"
model = None

# 2. Optimized Model Loader
def load_model():
    global model
    if model is None:
        print("🔄 Loading model in memory-restricted mode...")
        # compile=False saves significant RAM by not loading training configurations
        model = tf.keras.models.load_model(MODEL_PATH, compile=False)
        print("✅ Model loaded successfully!")
    return model

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
    # Use Pillow directly to keep memory footprint low
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB').resize((160, 160))
    # Convert to float32 and normalize manually to avoid Keras utility overhead
    img_array = np.array(img).astype('float32') / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

@app.get("/")
def home():
    return {"status": "AI Engine is Running", "memory_mode": "restricted"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # Load model only when needed (Lazy Loading)
        current_model = load_model()
        
        contents = await file.read()
        features = preprocess_image(contents)
        
        # predict_on_batch is often lighter on RAM than .predict()
        predictions = current_model.predict_on_batch(features)
        
        class_idx = np.argmax(predictions[0])
        confidence = float(np.max(predictions[0]))
        
        # 3. AGGRESSIVE Cleanup
        del features
        tf.keras.backend.clear_session()
        
        return {
            "disease": LABELS[class_idx],
            "confidence": confidence
        }
    except Exception as e:
        print(f"❌ Prediction Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)