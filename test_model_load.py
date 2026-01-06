"""
Test script to debug model loading
"""
import sys
import os
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.append(os.path.join(os.path.dirname(__file__), 'server', 'python'))

import torch
from MedViT import MedViT_large

print("Testing MedViT model loading...")

# Test 1: Create model with 1000 classes
print("\n1. Creating model with 1000 classes...")
try:
    model = MedViT_large(num_classes=1000)
    print("✓ Model created successfully")
    print(f"   Model type: {type(model)}")
    print(f"   Has proj_head: {hasattr(model, 'proj_head')}")
    if hasattr(model, 'proj_head'):
        print(f"   proj_head type: {type(model.proj_head)}")
        print(f"   proj_head: {model.proj_head}")
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()

# Test 2: Load checkpoint
print("\n2. Loading checkpoint...")
checkpoint_path = "server/python/checkpoints/medvit_large_imagenet.pth"
try:
    checkpoint = torch.load(checkpoint_path, map_location='cpu')
    print(f"✓ Checkpoint loaded")
    print(f"   Keys in checkpoint: {list(checkpoint.keys())[:5]}...")
    
    # Try to load state dict
    if 'model' in checkpoint:
        model.load_state_dict(checkpoint['model'], strict=False)
        print("✓ Loaded from checkpoint['model']")
    elif 'state_dict' in checkpoint:
        model.load_state_dict(checkpoint['state_dict'], strict=False)
        print("✓ Loaded from checkpoint['state_dict']")
    else:
        model.load_state_dict(checkpoint, strict=False)
        print("✓ Loaded checkpoint directly")
        
except Exception as e:
    print(f"✗ Error loading checkpoint: {e}")
    import traceback
    traceback.print_exc()

# Test 3: Adapt to different number of classes
print("\n3. Adapting to 7 classes (DermaMNIST)...")
try:
    in_features = model.proj_head[0].in_features
    print(f"   Original in_features: {in_features}")
    model.proj_head = torch.nn.Sequential(
        torch.nn.Linear(in_features, 7)
    )
    print(f"✓ Adapted to 7 classes")
    print(f"   New proj_head: {model.proj_head}")
except Exception as e:
    print(f"✗ Error adapting: {e}")
    import traceback
    traceback.print_exc()

# Test 4: Forward pass
print("\n4. Testing forward pass...")
try:
    model.eval()
    dummy_input = torch.randn(1, 3, 224, 224)
    with torch.no_grad():
        output = model(dummy_input)
    print(f"✓ Forward pass successful")
    print(f"   Output shape: {output.shape}")
    print(f"   Expected: torch.Size([1, 7])")
except Exception as e:
    print(f"✗ Error in forward pass: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*50)
print("Test complete!")
