# MedViT Pretrained Checkpoints

## 📥 Place Downloaded Weights Here

Download pretrained weights and place them in this directory:

### Required Files:

1. **medvit_small_imagenet.pth**
   - Download: https://drive.google.com/file/d/14wcH5cm8P63cMZAUHA1lhhJgMVOw_5VQ/view?usp=sharing
   - Size: ~50 MB
   - Accuracy: 83.70%

2. **medvit_base_imagenet.pth**
   - Download: https://drive.google.com/file/d/1Lrfzjf3CK7YOztKa8D6lTUZjYJIiT7_s/view?usp=sharing
   - Size: ~100 MB
   - Accuracy: 83.92%

3. **medvit_large_imagenet.pth** ⭐ Recommended
   - Download: https://drive.google.com/file/d/1sU-nLpYuCI65h7MjFJKG0yphNAlUFSKG/view?usp=sharing
   - Size: ~200 MB
   - Accuracy: 83.96%

## 🎯 Quick Start

**Minimum requirement:** Download at least one checkpoint file.

**Recommended:** Download MedViT-Large for best accuracy.

## ⚠️ Important

Without these weights, the model will use **random initialization** and predictions will be inaccurate!

## 📝 After Downloading

1. Rename files to match the names above
2. Place them in this directory
3. Restart the MedViT API server
4. Look for: `✓ Loaded pretrained checkpoint from ...`

See `../../DOWNLOAD_WEIGHTS.md` for detailed instructions.
