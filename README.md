# Zero Hunger

An AI-powered agricultural disease detection system aimed at helping farmers identify crop diseases early and take appropriate action. This project combines machine learning models with a modern web interface to provide real-time crop disease diagnosis.

## Project Structure

```
Zero-HungerImpeccable/
├── backend/              # Python/ML backend
│   ├── api/             # Flask API server
│   ├── inference/       # Model inference scripts
│   ├── models/          # Trained ML models (.keras, .tflite)
│   └── training/        # Model training scripts
├── docs/                # Documentation
│   ├── images/          # Documentation images
│   ├── body.md          # Design analysis
│   └── temp-critique-body.md
├── public/              # Static assets for frontend
│   ├── images/          # UI images
│   └── icons.svg
├── src/                 # React frontend source
│   ├── components/      # Reusable React components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   └── assets/          # Frontend assets
├── index.html           # HTML entry point
├── package.json         # Node.js dependencies
├── vite.config.js       # Vite configuration
└── eslint.config.js     # ESLint configuration
```

## Features

- **Crop Disease Detection**: AI-powered identification of various crop diseases
- **Modern UI**: Clean, responsive React-based interface
- **ML Models**: TensorFlow/Keras models for accurate disease classification
- **Real-time Analysis**: Fast inference using optimized models
- **Interactive Maps**: Leaflet integration for location-based features

## Technology Stack

### Frontend
- **React 19**: Modern React with latest features
- **Vite**: Fast build tool and dev server
- **React Router**: Client-side routing
- **Leaflet**: Interactive maps
- **Tailwind CSS**: Utility-first CSS framework

### Backend
- **Flask**: Python web framework for API
- **TensorFlow/Keras**: ML model training and inference
- **Scikit-learn**: Machine learning utilities

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.8 or higher)
- pip

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

### Backend Setup

1. Install Python dependencies:
```bash
pip install tensorflow flask scikit-learn numpy
```

2. Train the model (optional - pre-trained models included):
```bash
cd backend/training
python main.py
```

3. Run the API server:
```bash
cd backend/api
python app.py
```

## Model Training

The project uses MobileNetV3Large for crop disease classification. Training scripts are located in `backend/training/`:

- `main.py`: Main training script with data augmentation and class weighting
- `evaluate.py`: Model evaluation script

## API Endpoints

The Flask API provides endpoints for:
- Image upload and analysis
- Disease prediction
- Model inference

## Documentation

Additional documentation can be found in the `docs/` directory:
- `body.md`: Design health score analysis and UX recommendations
- `images/`: Visual documentation and diagrams

## Contributing

This project is part of the Zero Hunger initiative to use AI for sustainable agriculture.
