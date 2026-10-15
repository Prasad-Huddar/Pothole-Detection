"""
ROADVISION AI — RDD2022 Dataset Training Pipeline
=================================================
Automated training and fine-tuning pipeline for YOLO11 on the
Road Damage Dataset 2022 (RDD2022) with advanced anti-overfitting measures.

Key Anti-Overfitting Controls:
- EarlyStopping (patience=8)
- Weight Decay (L2 regularization: 0.0005)
- Cosine Learning Rate Decay Schedule (cos_lr=True)
- Head Dropout (dropout=0.10)
- Advanced Augmentations (Mosaic=0.80, Mixup=0.15, HSV-Jitter, Perspective)
- Close Mosaic in final 10 epochs (close_mosaic=10)
"""

import os
import sys
import argparse
from pathlib import Path
from ultralytics import YOLO

BASE_DIR = Path(__file__).parent
WEIGHTS_DIR = BASE_DIR / "weights"
WEIGHTS_DIR.mkdir(exist_ok=True)

DEFAULT_BASE_MODEL = "yolo11n.pt"
OUTPUT_WEIGHTS_PATH = WEIGHTS_DIR / "yolo11_rdd2022_best.pt"


def create_rdd2022_yaml(data_dir: Path) -> Path:
    """Generate standard Ultralytics YAML specification for RDD2022."""
    posix_path = str(data_dir.resolve()).replace('\\', '/')
    yaml_content = f"""# RDD2022 Road Damage Dataset Specification
path: {posix_path}
train: images/train
val: images/val
test: images/test

names:
  0: Longitudinal Crack (D00)
  1: Transverse Crack (D10)
  2: Alligator Crack (D20)
  3: Pothole (D40)
"""
    yaml_path = data_dir / "rdd2022.yaml"
    with open(yaml_path, "w", encoding="utf-8") as f:
        f.write(yaml_content)
    print(f"[INFO] Generated RDD2022 dataset config at: {yaml_path}")
    return yaml_path


def train_rdd2022(
    data_yaml: str,
    base_model: str = DEFAULT_BASE_MODEL,
    epochs: int = 60,
    imgsz: int = 640,
    batch_size: int = 16,
    device: str = "cpu",
    output_name: str = "yolo11_rdd2022_best.pt"
):
    print("=" * 70)
    print(" ROADVISION AI — TRAINING YOLO11 ON RDD2022 DATASET")
    print("=" * 70)
    print(f"Base Model:        {base_model}")
    print(f"Dataset YAML:      {data_yaml}")
    print(f"Target Epochs:     {epochs}")
    print(f"Image Resolution:  {imgsz}x{imgsz}")
    print(f"Batch Size:        {batch_size}")
    print(f"Compute Device:    {device}")
    print(f"Anti-Overfit:      EarlyStopping (patience=8), WeightDecay=0.0005, CosineLR, Dropout=0.10")
    print("=" * 70)

    # Initialize YOLO11 base architecture
    model = YOLO(base_model)

    # Train with strict anti-overfitting hyperparameters
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        imgsz=imgsz,
        batch=batch_size,
        device=device,
        # Anti-overfitting regularization
        patience=8,             # Early stopping: halt if validation mAP does not improve for 8 epochs
        weight_decay=0.0005,    # L2 weight regularization
        dropout=0.10,           # Head dropout to prevent co-adaptation
        cos_lr=True,            # Cosine annealing learning rate scheduler
        lr0=0.005,              # Initial learning rate
        lrf=0.01,               # Final learning rate factor
        # Augmentations for diverse road surface generalization
        mosaic=0.80,            # 4-image mosaic composition
        mixup=0.15,             # Image alpha blending
        hsv_h=0.015,            # Hue jitter
        hsv_s=0.7,              # Saturation jitter
        hsv_v=0.4,              # Value/brightness jitter
        degrees=5.0,            # Slight rotation
        translate=0.1,          # Translation jitter
        scale=0.3,              # Scale variation
        flipud=0.0,             # No vertical flips (roads stay on ground)
        fliplr=0.5,             # Horizontal flips (50%)
        close_mosaic=10,        # Turn off mosaic last 10 epochs for sharp bounding box edges
        project=str(BASE_DIR / "runs"),
        name="rdd2022_training",
        exist_ok=True,
        verbose=True,
    )

    # Evaluate validation metrics
    print("\n[INFO] Validating best checkpoint...")
    metrics = model.val()
    print(f"[INFO] Validation mAP50:    {metrics.box.map50:.4f}")
    print(f"[INFO] Validation mAP50-95: {metrics.box.map:.4f}")

    # Copy best weights to production directory
    best_pt = Path(model.trainer.save_dir) / "weights" / "best.pt"
    if best_pt.exists():
        target_path = WEIGHTS_DIR / output_name
        import shutil
        shutil.copyfile(best_pt, target_path)
        print(f"[SUCCESS] Exported best model to: {target_path}")

    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train YOLO11 on RDD2022 dataset.")
    parser.add_argument("--data", type=str, default=None, help="Path to rdd2022.yaml or dataset directory")
    parser.add_argument("--epochs", type=int, default=60, help="Number of training epochs (default: 60)")
    parser.add_argument("--imgsz", type=int, default=640, help="Image resolution (default: 640)")
    parser.add_argument("--batch", type=int, default=16, help="Batch size (default: 16)")
    parser.add_argument("--device", type=str, default="cpu", help="Device: 'cpu', '0', etc.")

    args = parser.parse_args()

    if not args.data:
        print("[NOTICE] No dataset specified. Example usage:")
        print("  python train_rdd2022.py --data path/to/rdd2022.yaml --epochs 50 --imgsz 640")
        print("\nIf you have an RDD2022 image folder, pass its path to automatically generate the YAML specification.")
    else:
        dpath = Path(args.data)
        if dpath.is_dir():
            yaml_path = create_rdd2022_yaml(dpath)
        else:
            yaml_path = dpath
        train_rdd2022(str(yaml_path), epochs=args.epochs, imgsz=args.imgsz, batch_size=args.batch, device=args.device)
