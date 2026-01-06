# MedViT Integration Guide

This document explains how the MedViT medical image classification model has been integrated into the inno disease detection page.

## Architecture

### Backend (Python Flask API)
- **Location**: `server/python/medvit_api.py`
- **Port**: 5001
- **Framework**: Flask with CORS enabled
- **Model Files**: 
  - `server/python/MedViT.py` - Model architecture
  - `server/python/utils.py` - Utility functions

### Frontend (React/TypeScript)
- **Location**: `client/pages/DiseaseDetection.tsx`
- **Integration**: REST API calls to Flask backend
- **Features**:
  - Dataset selection (8 medical datasets)
  - Model selection (Small, Base, Large)
  - Real-time image analysis
  - Confidence scores and predictions

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd server/python
pip install -r requirements.txt
```

**Required packages:**
- flask==3.0.0
- flask-cors==4.0.0
- torch==2.1.0
- torchvision==0.16.0
- einops==0.7.0
- timm==1.0.8
- Pillow==10.1.0
- numpy==1.24.3

### 2. Start the MedViT API Server

**Option A: Using the batch script (Windows)**
```bash
# From the inno root directory
start_medvit_server.bat
```

**Option B: Manual start**
```bash
cd server/python
python medvit_api.py
```

The server will start on `http://localhost:5001`

### 3. Start the Frontend Application

In a separate terminal:
```bash
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port shown in terminal)

## Available Datasets

The integration supports 8 medical imaging datasets:

1. **PathMNIST** (9 classes) - Colon pathology images
2. **ChestMNIST** (14 classes) - Chest X-ray findings
3. **DermaMNIST** (7 classes) - Skin lesion classification
4. **OCTMNIST** (4 classes) - Retinal OCT images
5. **PneumoniaMNIST** (2 classes) - Pneumonia detection
6. **RetinaMNIST** (5 classes) - Diabetic retinopathy stages
7. **BreastMNIST** (2 classes) - Breast ultrasound classification
8. **OrganMNIST** (11 classes) - Body organ identification

## API Endpoints

### POST /api/medvit/predict
Analyze a medical image and return predictions.

**Request:**
```json
{
  "image": "base64_encoded_image_data",
  "dataset": "DermaMNIST",
  "model_type": "MedViT-Large",
  "image_size": 224
}
```

**Response:**
```json
{
  "success": true,
  "predictions": [
    {
      "class": "Melanoma",
      "confidence": 87.5
    }
  ],
  "top_prediction": "Melanoma",
  "confidence": 87.5,
  "severity": "severe",
  "description": "AI-based medical image analysis...",
  "model_used": "MedViT-Large",
  "dataset": "DermaMNIST"
}
```

### GET /api/medvit/datasets
Get information about available datasets.

### GET /api/medvit/health
Health check endpoint.

## Model Variants

Three MedViT model sizes are available:

- **MedViT-Small**: Faster inference, lower accuracy
- **MedViT-Base**: Balanced performance
- **MedViT-Large**: Best accuracy (default)

## Usage Flow

1. Navigate to `/dashboard/disease-detection`
2. Select a dataset type (e.g., DermaMNIST for skin lesions)
3. Select a model variant (default: MedViT-Large)
4. Upload a medical image (drag & drop or file picker)
5. Click "Analyze Now"
6. View predictions with confidence scores
7. Optional actions:
   - Save to history
   - Find nearby doctors
   - Chat with health assistant

## Features

### Frontend Features
- ✅ Multiple dataset support
- ✅ Model selection (Small/Base/Large)
- ✅ Drag & drop image upload
- ✅ Real-time analysis with progress indicator
- ✅ Top 5 predictions display
- ✅ Confidence visualization
- ✅ Severity assessment
- ✅ Error handling with user-friendly messages
- ✅ Integration with existing features (doctor finder, chatbot)

### Backend Features
- ✅ RESTful API with CORS support
- ✅ Base64 image decoding
- ✅ Model caching for performance
- ✅ Multiple dataset support
- ✅ Configurable image preprocessing
- ✅ Detailed prediction results
- ✅ Error handling and logging

## Troubleshooting

### Issue: "Failed to analyze image. Make sure the MedViT API server is running on port 5001."

**Solution:** 
- Make sure the Python Flask server is running
- Check that port 5001 is not blocked by firewall
- Verify Python dependencies are installed

### Issue: Import errors when starting the API server

**Solution:**
```bash
cd server/python
pip install -r requirements.txt
```

### Issue: CORS errors in browser console

**Solution:**
- Ensure flask-cors is installed
- Check that the API server is running on port 5001
- Verify the frontend is making requests to the correct URL

### Issue: Model loading errors

**Solution:**
- Ensure MedViT.py and utils.py are in `server/python/`
- Check that the MedViT directory path is correct
- Verify all dependencies (einops, timm) are installed

## Performance Notes

- **First prediction**: May take 5-10 seconds (model loading)
- **Subsequent predictions**: 1-3 seconds (model cached)
- **Model size**: 
  - Small: ~50MB
  - Base: ~100MB
  - Large: ~200MB

## Future Enhancements

Potential improvements:
- [ ] Add checkpoint loading support for pretrained weights
- [ ] Implement batch prediction for multiple images
- [ ] Add model warm-up on server start
- [ ] Cache predictions for identical images
- [ ] Add GPU support detection and utilization
- [ ] Implement gradual model loading (lazy loading)
- [ ] Add prediction history visualization
- [ ] Export predictions to PDF report

## Credits

- **MedViT Model**: [Omid-Nejati/MedViT](https://github.com/Omid-Nejati/MedViT)
- **Paper**: [arXiv:2302.09462](https://arxiv.org/abs/2302.09462)
- **Integration**: Custom Flask API + React frontend

## License

MedViT model is subject to its original license. Please refer to the MedViT repository for details.
