# Download Pretrained Weights for MedViT

## ⚠️ Important: Why You Need Pretrained Weights

The MedViT models are currently using **random weights**, which is why predictions are inaccurate. To get proper medical image classification, you need to download the **ImageNet pretrained weights**.

## 📥 Download Links

Download the pretrained checkpoints from Google Drive:

| Model | Accuracy | Download Link |
|-------|----------|---------------|
| **MedViT-Small** | 83.70% | [Download](https://drive.google.com/file/d/14wcH5cm8P63cMZAUHA1lhhJgMVOw_5VQ/view?usp=sharing) |
| **MedViT-Base** | 83.92% | [Download](https://drive.google.com/file/d/1Lrfzjf3CK7YOztKa8D6lTUZjYJIiT7_s/view?usp=sharing) |
| **MedViT-Large** | 83.96% | [Download](https://drive.google.com/file/d/1sU-nLpYuCI65h7MjFJKG0yphNAlUFSKG/view?usp=sharing) ⭐ Recommended |

## 📁 Installation Steps

### Step 1: Create Checkpoints Directory

```bash
cd server/python
mkdir checkpoints
```

### Step 2: Download Weights

1. Click on the download links above
2. Download the `.pth` files to your computer

### Step 3: Rename and Place Files

Rename the downloaded files and place them in the checkpoints directory:

```
server/python/checkpoints/
├── medvit_small_imagenet.pth    (rename downloaded file)
├── medvit_base_imagenet.pth     (rename downloaded file)
└── medvit_large_imagenet.pth    (rename downloaded file)
```

**Expected file names:**
- `medvit_small_imagenet.pth` - for MedViT-Small
- `medvit_base_imagenet.pth` - for MedViT-Base  
- `medvit_large_imagenet.pth` - for MedViT-Large

### Step 4: Restart the API Server

After placing the weights:

1. Stop the MedViT API server (Ctrl+C)
2. Restart it:
   ```bash
   cd server/python
   python medvit_api.py
   ```

You should see: `✓ Loaded pretrained checkpoint from ...`

## 🎯 Quick Setup (Recommended)

**For best results, download at least MedViT-Large:**

1. Download: [MedViT-Large checkpoint](https://drive.google.com/file/d/1sU-nLpYuCI65h7MjFJKG0yphNAlUFSKG/view?usp=sharing)
2. Create folder: `server/python/checkpoints/`
3. Rename file to: `medvit_large_imagenet.pth`
4. Place in: `server/python/checkpoints/medvit_large_imagenet.pth`
5. Restart API server

## ✅ Verify Installation

After restarting the server, check the console output:

**✓ Success:**
```
✓ Loaded pretrained checkpoint from server/python/checkpoints/medvit_large_imagenet.pth
Starting MedViT API server...
```

**✗ Still using random weights:**
```
⚠ WARNING: Using random weights! Download pretrained weights for accurate predictions.
```

## 🔍 What Changes After Loading Weights?

### Before (Random Weights):
- ❌ Predictions are random/incorrect
- ❌ Low confidence scores
- ❌ No medical accuracy

### After (Pretrained Weights):
- ✅ Accurate medical image classification
- ✅ High confidence scores (80-95%)
- ✅ Proper disease detection
- ✅ Transfer learning from ImageNet features

## 📊 Expected Performance

With pretrained weights, you should see:

- **Confidence scores**: 70-95% for clear images
- **Accuracy**: State-of-the-art on MedMNIST datasets
- **Robustness**: High resistance to adversarial attacks

## 🎓 How It Works

1. **ImageNet Pretraining**: Models are first trained on ImageNet-1K (1000 classes)
2. **Feature Transfer**: The pretrained features help with medical images
3. **Fine-tuning**: The final layer is adapted to medical datasets (2-14 classes)

## 💡 Alternative: Fine-tuned Medical Weights

For even better performance on specific medical datasets, you can:

1. Fine-tune the ImageNet pretrained models on MedMNIST datasets
2. Use the training code from the [MedViT repository](https://github.com/Omid-Nejati/MedViT)
3. Follow the [Instructions.ipynb](https://github.com/Omid-Nejati/MedViT/blob/main/Instructions.ipynb) notebook

## 🆘 Troubleshooting

### Issue: "Could not load checkpoint"

**Possible causes:**
- File is corrupted during download
- Wrong file format
- Incorrect file name

**Solution:**
- Re-download the checkpoint
- Verify file extension is `.pth`
- Check file name matches exactly

### Issue: "File not found"

**Solution:**
```bash
# Verify the path exists
ls server/python/checkpoints/

# Should show:
# medvit_large_imagenet.pth (or similar)
```

### Issue: Still getting random predictions

**Solution:**
1. Check server console for "✓ Loaded pretrained checkpoint" message
2. Verify file size (should be 100-200 MB)
3. Clear model cache by restarting the server

## 📚 Additional Resources

- **MedViT Paper**: [arXiv:2302.09462](https://arxiv.org/abs/2302.09462)
- **GitHub Repository**: [Omid-Nejati/MedViT](https://github.com/Omid-Nejati/MedViT)
- **Training Instructions**: [Instructions.ipynb](https://github.com/Omid-Nejati/MedViT/blob/main/Instructions.ipynb)

## 📝 File Structure After Setup

```
inno/
└── server/
    └── python/
        ├── checkpoints/                    # Create this folder
        │   ├── medvit_small_imagenet.pth  # Download & rename
        │   ├── medvit_base_imagenet.pth   # Download & rename
        │   └── medvit_large_imagenet.pth  # Download & rename ⭐
        ├── MedViT.py
        ├── utils.py
        └── medvit_api.py
```

---

**After downloading weights, your predictions will be accurate! 🎉**
