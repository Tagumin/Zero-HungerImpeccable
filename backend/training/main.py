import tensorflow as tf
from tensorflow.keras import layers, models, applications
from sklearn.utils.class_weight import compute_class_weight
import numpy as np
import os
from pathlib import Path

# ==========================================
# 1. Configuration
# ==========================================
BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent
DATA_DIR = str(PROJECT_ROOT / 'dataset')
BATCH_SIZE = 32
IMG_SIZE = (224, 224) 
EPOCHS = 15
LEARNING_RATE = 0.001
MODEL_FILENAME = str(BACKEND_DIR / 'models' / 'best_mobilenet_large.keras')

# ==========================================
# 2. Data Loading (Train, Valid, Test)
# ==========================================
print("\nLoading Training Data...")
train_dataset = tf.keras.utils.image_dataset_from_directory(
    os.path.join(DATA_DIR, 'train'), shuffle=True, batch_size=BATCH_SIZE, image_size=IMG_SIZE)

print("Loading Validation Data...")
valid_dataset = tf.keras.utils.image_dataset_from_directory(
    os.path.join(DATA_DIR, 'valid'), shuffle=True, batch_size=BATCH_SIZE, image_size=IMG_SIZE)

print("Loading Test Data...")
test_dataset = tf.keras.utils.image_dataset_from_directory(
    os.path.join(DATA_DIR, 'test'), shuffle=False, batch_size=BATCH_SIZE, image_size=IMG_SIZE)

class_names = train_dataset.class_names
num_classes = len(class_names)

# Optimize pipelines
AUTOTUNE = tf.data.AUTOTUNE
train_dataset = train_dataset.cache().prefetch(buffer_size=AUTOTUNE)
valid_dataset = valid_dataset.cache().prefetch(buffer_size=AUTOTUNE)
test_dataset = test_dataset.cache().prefetch(buffer_size=AUTOTUNE)

# ==========================================
# 3. Calculate Class Weights (Handling Imbalance)
# ==========================================
print("\nCalculating class weights...")
# Extract all labels from the training dataset
labels = np.concatenate([y for x, y in train_dataset], axis=0)
class_weights = compute_class_weight(class_weight='balanced', classes=np.unique(labels), y=labels)
class_weights_dict = dict(enumerate(class_weights))

# ==========================================
# 4. Model Setup (MobileNetV3Large)
# ==========================================
print("\nBuilding MobileNetV3Large Architecture...")
data_augmentation = tf.keras.Sequential([
  layers.RandomFlip('horizontal'),
  layers.RandomRotation(0.2),
  layers.RandomZoom(0.2),
], name="data_augmentation")

base_model = applications.MobileNetV3Large(
    input_shape=IMG_SIZE + (3,),
    include_top=False, 
    weights='imagenet',
    include_preprocessing=True 
)
base_model.trainable = False # Freeze base layers

inputs = tf.keras.Input(shape=IMG_SIZE + (3,))
x = data_augmentation(inputs)
x = base_model(x, training=False)
x = layers.GlobalAveragePooling2D()(x)
x = layers.Dropout(0.2)(x) 
outputs = layers.Dense(num_classes, activation='softmax')(x)

model = tf.keras.Model(inputs, outputs)
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=LEARNING_RATE),
    loss=tf.keras.losses.SparseCategoricalCrossentropy(),
    metrics=['accuracy']
)

# ==========================================
# 5. Training
# ==========================================
print("\nStarting Training...")
callbacks = [
    tf.keras.callbacks.ModelCheckpoint(
        filepath=MODEL_FILENAME, # Uses the centralized filename variable
        save_best_only=True,
        monitor='val_accuracy'
    ),
    tf.keras.callbacks.EarlyStopping(
        patience=5,
        restore_best_weights=True,
        monitor='val_accuracy'
    )
]

history = model.fit(
    train_dataset,
    validation_data=valid_dataset,
    epochs=EPOCHS,
    class_weight=class_weights_dict, 
    callbacks=callbacks,
    verbose=2 # Keeps the terminal clean
)

print("Training finished.")