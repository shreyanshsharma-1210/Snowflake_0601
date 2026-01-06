# 🚀 MedViT Deployment Alternatives

While Netlify provides a quick deployment option, it has limitations for ML models. Here are better alternatives for production use:

## 🎯 Recommended: Hugging Face Spaces

**Best for**: Full model with pretrained weights, easy deployment

### Advantages
- ✅ No size limits for models
- ✅ GPU support available
- ✅ Built for ML workloads
- ✅ Free tier available
- ✅ Automatic model caching

### Deploy to Hugging Face Spaces

1. **Create Space:**
   ```bash
   # Install Hugging Face CLI
   pip install huggingface_hub
   
   # Login
   huggingface-cli login
   
   # Create new space
   huggingface-cli repo create medvit-disease-detection --type space --space_sdk gradio
   ```

2. **Upload Files:**
   ```bash
   git clone https://huggingface.co/spaces/yourusername/medvit-disease-detection
   cd medvit-disease-detection
   
   # Copy your files
   cp ../server/python/* .
   
   # Create app.py for Gradio interface
   # (see example below)
   ```

3. **Example Gradio App:**
   ```python
   import gradio as gr
   import torch
   from PIL import Image
   from medvit_api import predict_disease
   
   def analyze_image(image, dataset):
       # Convert PIL image to base64
       import io
       import base64
       buffered = io.BytesIO()
       image.save(buffered, format="PNG")
       img_str = base64.b64encode(buffered.getvalue()).decode()
       
       # Make prediction
       result = predict_disease(img_str, dataset)
       return result
   
   iface = gr.Interface(
       fn=analyze_image,
       inputs=[
           gr.Image(type="pil"),
           gr.Dropdown(["PathMNIST", "ChestMNIST", "DermaMNIST"], value="PathMNIST")
       ],
       outputs=gr.JSON(),
       title="MedViT Disease Detection",
       description="AI-powered medical image analysis"
   )
   
   iface.launch()
   ```

## 🚂 Railway

**Best for**: Full-stack deployment with database support

### Advantages
- ✅ No function timeouts
- ✅ Persistent storage
- ✅ Database support
- ✅ Custom domains
- ✅ Environment variables

### Deploy to Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Deploy:**
   ```bash
   cd ../server/python
   railway init
   railway up
   ```

3. **Railway Configuration (`railway.toml`):**
   ```toml
   [build]
   builder = "nixpacks"
   
   [deploy]
   startCommand = "python medvit_api.py"
   
   [env]
   PORT = 5001
   ```

## ☁️ Render

**Best for**: Simple deployment with automatic scaling

### Advantages
- ✅ Free tier with 750 hours
- ✅ Automatic HTTPS
- ✅ Git-based deployment
- ✅ Environment variables
- ✅ Custom domains

### Deploy to Render

1. **Create `render.yaml`:**
   ```yaml
   services:
     - type: web
       name: medvit-api
       env: python
       buildCommand: pip install -r requirements.txt
       startCommand: python medvit_api.py
       envVars:
         - key: PORT
           value: 10000
   ```

2. **Connect Repository:**
   - Go to [Render Dashboard](https://render.com)
   - Connect your GitHub repository
   - Select "Web Service"
   - Configure build settings

## 🐳 Docker + Cloud Platforms

**Best for**: Maximum control and scalability

### Docker Configuration

1. **Create `Dockerfile`:**
   ```dockerfile
   FROM python:3.9-slim
   
   WORKDIR /app
   
   # Install system dependencies
   RUN apt-get update && apt-get install -y \
       wget \
       && rm -rf /var/lib/apt/lists/*
   
   # Copy requirements and install Python dependencies
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   
   # Copy application code
   COPY . .
   
   # Download pretrained weights
   RUN mkdir -p checkpoints && \
       wget -O checkpoints/medvit_large_imagenet.pth \
       "https://drive.google.com/uc?export=download&id=1sU-nLpYuCI65h7MjFJKG0yphNAlUFSKG"
   
   EXPOSE 5001
   
   CMD ["python", "medvit_api.py"]
   ```

2. **Deploy to Various Platforms:**

   **Google Cloud Run:**
   ```bash
   gcloud run deploy medvit-api \
     --source . \
     --platform managed \
     --region us-central1 \
     --memory 2Gi \
     --cpu 2
   ```

   **AWS ECS/Fargate:**
   ```bash
   aws ecr create-repository --repository-name medvit-api
   docker build -t medvit-api .
   docker tag medvit-api:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/medvit-api:latest
   docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/medvit-api:latest
   ```

   **Azure Container Instances:**
   ```bash
   az container create \
     --resource-group myResourceGroup \
     --name medvit-api \
     --image myregistry.azurecr.io/medvit-api:latest \
     --cpu 2 \
     --memory 4 \
     --ports 5001
   ```

## 📊 Comparison Table

| Platform | Pros | Cons | Best For |
|----------|------|------|----------|
| **Netlify** | ✅ Easy deploy<br>✅ CDN<br>✅ Free tier | ❌ 10s timeout<br>❌ No large models<br>❌ Limited memory | Quick prototypes |
| **Hugging Face** | ✅ ML-focused<br>✅ GPU support<br>✅ Model hosting | ❌ Limited customization<br>❌ Gradio interface only | ML demos & research |
| **Railway** | ✅ Full-stack<br>✅ Database support<br>✅ No timeouts | ❌ Paid after free tier<br>❌ Limited free resources | Production apps |
| **Render** | ✅ Simple setup<br>✅ Auto-scaling<br>✅ Free tier | ❌ Cold starts<br>❌ Limited free tier | Small to medium apps |
| **Docker + Cloud** | ✅ Full control<br>✅ Scalability<br>✅ Enterprise ready | ❌ Complex setup<br>❌ Higher costs | Enterprise/Production |

## 🎯 Recommendations by Use Case

### 🔬 Research & Prototyping
**→ Hugging Face Spaces**
- Quick deployment
- Share with community
- GPU access for training

### 🏥 Medical Institution
**→ Docker + Private Cloud**
- Data privacy compliance
- Custom security measures
- On-premise deployment option

### 🚀 Startup/Production
**→ Railway or Render**
- Cost-effective scaling
- Easy maintenance
- Professional features

### 📱 Mobile App Backend
**→ Google Cloud Run**
- Auto-scaling
- Pay-per-use
- Global CDN

## 🔐 Security Considerations

### HIPAA Compliance
For medical data, ensure:
- ✅ End-to-end encryption
- ✅ Access logging
- ✅ Data residency requirements
- ✅ Business Associate Agreements (BAA)

### Recommended Secure Platforms
1. **AWS** - HIPAA eligible services
2. **Google Cloud** - Healthcare APIs
3. **Azure** - Healthcare Bot service
4. **Private Cloud** - Full control

## 📈 Performance Optimization

### Model Optimization
```python
# Use TorchScript for faster inference
model = torch.jit.script(model)

# Quantization for smaller models
model = torch.quantization.quantize_dynamic(
    model, {torch.nn.Linear}, dtype=torch.qint8
)

# ONNX for cross-platform deployment
torch.onnx.export(model, dummy_input, "medvit.onnx")
```

### Caching Strategies
```python
# Redis for model caching
import redis
r = redis.Redis(host='localhost', port=6379, db=0)

# Cache predictions
def cached_predict(image_hash, dataset):
    cache_key = f"prediction:{image_hash}:{dataset}"
    cached = r.get(cache_key)
    if cached:
        return json.loads(cached)
    
    result = predict(image, dataset)
    r.setex(cache_key, 3600, json.dumps(result))  # 1 hour cache
    return result
```

## 🚀 Next Steps

1. **Choose your platform** based on requirements
2. **Download pretrained weights** for accuracy
3. **Set up monitoring** and logging
4. **Implement caching** for performance
5. **Add authentication** for security
6. **Set up CI/CD** for updates

---

**Need help choosing? Open an issue and we'll help you decide!**
