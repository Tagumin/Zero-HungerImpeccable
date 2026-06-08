from flask import Flask, request, render_template, jsonify
import tensorflow as tf
import numpy as np
from flask_cors import CORS 
import io
from pathlib import Path
from PIL import Image

BACKEND_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BACKEND_DIR / 'models' / 'best_model.keras'

app = Flask(__name__)
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# Monkey patch Keras Layer to ignore unsupported legacy arguments
original_layer_init = tf.keras.layers.Layer.__init__

def new_layer_init(self, *args, **kwargs):
    kwargs.pop('renorm', None)
    kwargs.pop('renorm_clipping', None)
    kwargs.pop('renorm_momentum', None)
    kwargs.pop('quantization_config', None)
    original_layer_init(self, *args, **kwargs)

tf.keras.layers.Layer.__init__ = new_layer_init

# Load Keras model
model = tf.keras.models.load_model(str(MODEL_PATH), compile=False)

CLASS_NAMES = ['Corn_Blight', 'Corn_CommonRust', 'Corn_GrayLeafSpot', 'Corn_Healthy',
    'Potato_EarlyBlight', 'Potato_Healthy', 'Potato_Lateblight',
    'Rice_BacterialLeafBlight', 'Rice_BrownSpot', 'Rice_Healthy',
    'Rice_LeafBlast', 'Rice_LeafScald', 'Rice_SheathBlight',
    'Soybean_BacterialBlight', 'Soybean_DownyMildew', 'Soybean_Healthy',
    'Soybean_MosaicVirus', 'Soybean_Rust', 'Soybean__DiabroticaSpeciosa',
    'Soybean__PowderyMildew', 'Soybean__SouthernBlight', 'Wheat_BlackRust',
    'Wheat_BrownRust', 'Wheat_FusariumHeadBlight', 'Wheat_Healthy',
    'Wheat_LeafBlight', 'Wheat_Mildew', 'Wheat_Septoria', 'Wheat_Smut',
    'Wheat_TanSpot', 'Wheat_YellowRust']

IMG_SIZE = (224, 224)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def predict_image(file_bytes):
    img = Image.open(io.BytesIO(file_bytes)).convert('RGB')
    img = img.resize(IMG_SIZE)
    img_array = np.array(img, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)

    predictions = model.predict(img_array)
    predicted_class = CLASS_NAMES[np.argmax(predictions[0])]
    confidence = float(np.max(predictions[0])) * 100

    return predicted_class, confidence

@app.route('/')
def index():
    return render_template('./index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'Tidak ada file yang diupload'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'File kosong'}), 400

    if file and allowed_file(file.filename):
        file_bytes = file.read()
        predicted_class, confidence = predict_image(file_bytes)

        return jsonify({
            'class': predicted_class,
            'confidence': f'{confidence:.2f}%'
        })

    return jsonify({'error': 'Format file tidak didukung'}), 400

if __name__ == '__main__':
    app.run(debug=True)