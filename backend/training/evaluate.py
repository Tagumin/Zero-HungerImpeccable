import tensorflow as tf
import os
from pathlib import Path

# ==========================================
# 1. Configuration
# ==========================================
BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent
DATA_DIR = str(PROJECT_ROOT / 'dataset')
BATCH_SIZE = 16 # Lowering batch size reduces memory spikes during evaluation
IMG_SIZE = (224, 224)
MODEL_FILENAME = str(BACKEND_DIR / 'models' / 'best_mobilenet_large.keras')
TFLITE_FILENAME = str(BACKEND_DIR / 'models' / 'offline_crop_disease_model_large.tflite')

# ==========================================
# 2. Memory-Safe Data Loading
# ==========================================
print("\nLoading Test Data...")
# Notice we DO NOT use .cache() here to save system RAM
test_dataset = tf.keras.utils.image_dataset_from_directory(
    os.path.join(DATA_DIR, 'test'), 
    shuffle=False, 
    batch_size=BATCH_SIZE, 
    image_size=IMG_SIZE
).prefetch(buffer_size=tf.data.AUTOTUNE)

# ==========================================
# 3. Evaluation & TFLite Conversion
# ==========================================
print(f"\nLoading best model '{MODEL_FILENAME}' for final evaluation...")
try:
    best_model = tf.keras.models.load_model(MODEL_FILENAME)
except Exception as e:
    print(f"Error loading model: {e}")
    print(f"Make sure '{MODEL_FILENAME}' exists in your directory!")
    exit()

print("\nEvaluating on unseen Test Dataset...")
# This will now process the images in smaller chunks without caching everything
test_loss, test_acc = best_model.evaluate(test_dataset)
print(f"-> Test Accuracy: {test_acc:.4f} | Test Loss: {test_loss:.4f}")

print("\nConverting model to TensorFlow Lite format...")
converter = tf.lite.TFLiteConverter.from_keras_model(best_model)
converter.optimizations = [tf.lite.Optimize.DEFAULT] 
tflite_model = converter.convert()

with open(TFLITE_FILENAME, 'wb') as f:
    f.write(tflite_model)

print(f"\nPipeline Complete! Your mobile-ready model is: {TFLITE_FILENAME}")