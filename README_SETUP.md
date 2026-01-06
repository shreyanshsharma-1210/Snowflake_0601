# Complete Setup Guide - MedViT Integration

## Quick Start

### Step 1: Install Python Dependencies

```bash
cd server/python
pip install -r requirements.txt
```

### Step 2: Start MedViT API Server

**Windows:**
```bash
# From inno root directory
start_medvit_server.bat
```

**Or manually:**
```bash
cd server/python
python medvit_api.py
```

Server will start at: `http://localhost:5001`

### Step 3: Install Node.js Dependencies

```bash
# From inno root directory
npm install
```

### Step 4: Start Frontend

```bash
npm run dev
```

Frontend will start at: `http://localhost:5173` (or shown port)

### Step 5: Test the Integration

1. Open browser to `http://localhost:5173`
2. Navigate to **Dashboard → Disease Detection**
3. Select a dataset (e.g., DermaMNIST)
4. Upload a medical image
5. Click "Analyze Now"
6. View predictions!

## What Was Integrated

### ✅ Backend Components

1. **Flask API Server** (`server/python/medvit_api.py`)
   - REST API for MedViT predictions
   - Supports 8 medical datasets
   - 3 model variants (Small, Base, Large)
   - CORS enabled for frontend communication

2. **MedViT Model Files**
   - `server/python/MedViT.py` - Model architecture
   - `server/python/utils.py` - Utility functions
   - Copied from your MedViT project

3. **Python Dependencies** (`server/python/requirements.txt`)
   - Flask, PyTorch, torchvision, timm, einops, etc.

### ✅ Frontend Components

1. **Updated Disease Detection Page** (`client/pages/DiseaseDetection.tsx`)
   - Dataset selector (8 medical datasets)
   - Model selector (Small/Base/Large)
   - API integration with MedViT backend
   - Real-time predictions with confidence scores
   - Error handling and user feedback
   - Integration with existing features (doctor finder, chatbot)

### ✅ Documentation & Scripts

1. **Integration Guide** (`MEDVIT_INTEGRATION.md`)
   - Complete API documentation
   - Troubleshooting guide
   - Architecture overview

2. **Startup Script** (`start_medvit_server.bat`)
   - Quick launch for Windows

3. **Test Script** (`test_medvit_api.py`)
   - API health checks
   - Endpoint testing

## Supported Medical Datasets

| Dataset | Classes | Medical Domain |
|---------|---------|----------------|
| PathMNIST | 9 | Colon Pathology |
| ChestMNIST | 14 | Chest X-Ray Findings |
| DermaMNIST | 7 | Skin Lesions |
| OCTMNIST | 4 | Retinal OCT |
| PneumoniaMNIST | 2 | Pneumonia Detection |
| RetinaMNIST | 5 | Diabetic Retinopathy |
| BreastMNIST | 2 | Breast Ultrasound |
| OrganMNIST | 11 | Body Organs |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│                 client/pages/DiseaseDetection.tsx            │
│                                                              │
│  [Upload Image] → [Select Dataset] → [Select Model]         │
│                         ↓                                    │
│                   [Analyze Button]                           │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP POST
                           │ /api/medvit/predict
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Flask API)                        │
│                server/python/medvit_api.py                   │
│                                                              │
│  [Decode Image] → [Load Model] → [Preprocess]               │
│                         ↓                                    │
│                   [MedViT Inference]                         │
│                         ↓                                    │
│              [Return Predictions + Confidence]               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    MedViT Model                              │
│              server/python/MedViT.py                         │
│                                                              │
│  CNN-Transformer Hybrid Architecture                         │
│  - Convolutional Attention                                   │
│  - Robust to Adversarial Attacks                             │
│  - State-of-the-art Medical Image Classification             │
└─────────────────────────────────────────────────────────────┘
```

## Testing Checklist

- [ ] Python dependencies installed
- [ ] MedViT API server running on port 5001
- [ ] Frontend running on port 5173
- [ ] Can access disease detection page
- [ ] Can select different datasets
- [ ] Can upload images
- [ ] Predictions return successfully
- [ ] Confidence scores display correctly
- [ ] Error messages show when API is down

## Common Issues & Solutions

### Issue: "Module 'MedViT' not found"
**Solution:** Make sure MedViT.py and utils.py are in `server/python/`

### Issue: "Port 5001 already in use"
**Solution:** 
```bash
# Find and kill process using port 5001
netstat -ano | findstr :5001
taskkill /PID <process_id> /F
```

### Issue: Frontend can't connect to API
**Solution:**
- Check API server is running
- Verify URL in DiseaseDetection.tsx is `http://localhost:5001`
- Check browser console for CORS errors

### Issue: Slow predictions
**Solution:**
- First prediction loads the model (slow)
- Subsequent predictions are cached (fast)
- Consider using MedViT-Small for faster inference

## Next Steps

1. **Add Pretrained Weights**
   - Download pretrained checkpoints from MedViT repo
   - Place in `server/python/checkpoints/`
   - Update API to load checkpoints

2. **Deploy to Production**
   - Use gunicorn for Flask API
   - Add nginx reverse proxy
   - Enable HTTPS

3. **Enhance Features**
   - Batch prediction support
   - Prediction history visualization
   - Export results to PDF
   - Add more medical datasets

## File Structure

```
inno/
├── client/
│   └── pages/
│       └── DiseaseDetection.tsx      # Updated frontend
├── server/
│   └── python/
│       ├── medvit_api.py             # Flask API server
│       ├── MedViT.py                 # Model architecture
│       ├── utils.py                  # Utilities
│       └── requirements.txt          # Python deps
├── start_medvit_server.bat           # Quick start script
├── test_medvit_api.py                # Test script
├── MEDVIT_INTEGRATION.md             # Detailed docs
└── README_SETUP.md                   # This file
```

## Credits

- **MedViT Model**: [Omid-Nejati/MedViT](https://github.com/Omid-Nejati/MedViT)
- **Paper**: MedViT: A Robust Vision Transformer for Generalized Medical Image Classification
- **Integration**: Custom implementation for inno platform

---

**Need Help?** Check `MEDVIT_INTEGRATION.md` for detailed documentation.
