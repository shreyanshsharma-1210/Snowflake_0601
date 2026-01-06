# MedViT Disease Detection API - Netlify Deployment

🏥 **AI-powered medical image analysis using Vision Transformer technology**

## 🚀 Quick Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/medvit-netlify)

## 📋 Features

- **Disease Detection**: AI-powered analysis of medical images
- **Multiple Datasets**: Support for 8 different medical datasets
- **Serverless Architecture**: Optimized for Netlify Functions
- **CORS Enabled**: Ready for frontend integration
- **Lightweight Model**: MedViT-Small for fast inference

## 🎯 Supported Medical Datasets

| Dataset | Description | Classes |
|---------|-------------|---------|
| PathMNIST | Pathology Images | 9 tissue types |
| ChestMNIST | Chest X-rays | 14 conditions |
| DermaMNIST | Dermatology Images | 7 skin conditions |
| OCTMNIST | Retinal OCT | 4 conditions |
| PneumoniaMNIST | Pneumonia Detection | 2 classes |
| RetinaMNIST | Diabetic Retinopathy | 5 severity levels |
| BreastMNIST | Breast Ultrasound | 2 classes |
| OrganMNIST | Organ Classification | 11 organs |

## 🛠️ API Endpoints

### POST `/.netlify/functions/predict`
Analyze medical images for disease detection.

**Request:**
```json
{
  "image": "base64_encoded_image",
  "dataset": "PathMNIST",
  "image_size": 224
}
```

**Response:**
```json
{
  "success": true,
  "predictions": [
    {
      "class": "Colorectal Adenocarcinoma",
      "confidence": 87.5
    }
  ],
  "top_prediction": "Colorectal Adenocarcinoma",
  "confidence": 87.5,
  "severity": "severe",
  "model_used": "MedViT-Small",
  "dataset": "PathMNIST"
}
```

### GET `/.netlify/functions/datasets`
Get available datasets and their class labels.

### GET `/.netlify/functions/health`
Health check endpoint.

## 📦 Deployment Steps

### Option 1: Deploy via Netlify Dashboard

1. **Fork this repository** to your GitHub account

2. **Connect to Netlify:**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Choose GitHub and select your forked repository

3. **Configure Build Settings:**
   - Build command: `npm install`
   - Publish directory: `public`
   - Functions directory: `netlify/functions`

4. **Deploy:**
   - Click "Deploy site"
   - Wait for build to complete (~5-10 minutes)

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from project directory
cd netlify-medvit
netlify deploy --prod
```

### Option 3: One-Click Deploy

Click the deploy button above and follow the prompts.

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Install Netlify CLI
npm install -g netlify-cli

# Start local development server
netlify dev

# API will be available at:
# http://localhost:8888/.netlify/functions/predict
# http://localhost:8888/.netlify/functions/health
# http://localhost:8888/.netlify/functions/datasets
```

## 📝 Usage Examples

### JavaScript/Frontend Integration

```javascript
async function analyzeImage(imageFile, dataset = 'PathMNIST') {
  // Convert image to base64
  const base64 = await fileToBase64(imageFile);
  
  const response = await fetch('/.netlify/functions/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: base64,
      dataset: dataset,
      image_size: 224
    })
  });
  
  const result = await response.json();
  return result;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}
```

### Python Integration

```python
import requests
import base64

def analyze_image(image_path, dataset='PathMNIST'):
    # Read and encode image
    with open(image_path, 'rb') as f:
        image_data = base64.b64encode(f.read()).decode()
    
    # Make API request
    response = requests.post(
        'https://your-site.netlify.app/.netlify/functions/predict',
        json={
            'image': f'data:image/jpeg;base64,{image_data}',
            'dataset': dataset,
            'image_size': 224
        }
    )
    
    return response.json()
```

## ⚠️ Important Limitations

### Netlify Constraints
- **Function Timeout**: 10 seconds maximum
- **Memory Limit**: 1GB
- **Package Size**: 50MB compressed
- **No Pretrained Weights**: Using random initialization

### Accuracy Notice
⚠️ **This deployment uses a lightweight model without pretrained weights for Netlify compatibility. For production accuracy, consider:**

1. **Hugging Face Spaces** - Full model with pretrained weights
2. **Railway/Render** - Better suited for ML workloads
3. **AWS Lambda** - With larger memory limits
4. **Google Cloud Functions** - With custom runtimes

## 🔄 Upgrading to Full Model

For production use with pretrained weights, see:
- `../server/python/` - Full Flask API with pretrained weights
- `DEPLOYMENT_ALTERNATIVES.md` - Other deployment options

## 🏥 Medical Disclaimer

This tool is for educational and research purposes only. Always consult qualified healthcare professionals for medical diagnosis and treatment decisions.

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/medvit-netlify/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/medvit-netlify/discussions)

---

**Built with ❤️ for the medical AI community**
