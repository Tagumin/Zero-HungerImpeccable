from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io

app = Flask(__name__)
# Enable CORS so your React frontend (usually on port 5173 or 3000) can communicate with Flask
CORS(app) 

# Load the saved Keras model
print("Loading model...")
model = tf.keras.models.load_model('best_mobilenet_large.keras')
print("Model loaded successfully.")

# The exact 31 classes from your training
CLASS_NAMES = [
    'Corn_Blight', 'Corn_CommonRust', 'Corn_GrayLeafSpot', 'Corn_Healthy', 
    'Potato_EarlyBlight', 'Potato_Healthy', 'Potato_Lateblight', 
    'Rice_BacterialLeafBlight', 'Rice_BrownSpot', 'Rice_Healthy', 
    'Rice_LeafBlast', 'Rice_LeafScald', 'Rice_SheathBlight', 
    'Soybean_BacterialBlight', 'Soybean_DownyMildew', 'Soybean_Healthy', 
    'Soybean_MosaicVirus', 'Soybean_Rust', 'Soybean__DiabroticaSpeciosa', 
    'Soybean__PowderyMildew', 'Soybean__SouthernBlight', 'Wheat_BlackRust', 
    'Wheat_BrownRust', 'Wheat_FusariumHeadBlight', 'Wheat_Healthy', 
    'Wheat_LeafBlight', 'Wheat_Mildew', 'Wheat_Septoria', 'Wheat_Smut', 
    'Wheat_TanSpot', 'Wheat_YellowRust'
]

def preprocess_image(image_bytes):
    """Resizes and formats the image for MobileNetV3."""
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize((224, 224))
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = tf.expand_dims(img_array, 0) # Add batch dimension
    return img_array

@app.route('/predict', methods=['POST'])
def predict():
    # Check if a file was actually sent
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    try:
        # Preprocess the uploaded image
        img_tensor = preprocess_image(file.read())
        
        # Run inference
        predictions = model.predict(img_tensor)
        
        # Extract the highest probability
        class_idx = np.argmax(predictions[0])
        confidence_score = float(predictions[0][class_idx]) * 100
        predicted_class = CLASS_NAMES[class_idx]
        
        # For UI display, replace underscores with spaces (e.g., 'Corn_Blight' -> 'Corn Blight')
        formatted_name = predicted_class.replace('_', ' ')

        return jsonify({
            'disease': formatted_name,
            'raw_class': predicted_class,
            'confidence': f"{confidence_score:.1f}"
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)