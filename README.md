# ROADVISION AI
## AI-Assisted Intelligent Pothole Detection, Severity Assessment and Road Risk Monitoring System

---

## Project Overview

ROADVISION AI is a full-stack AI-powered road infrastructure monitoring platform built for a final-year engineering project. It detects potholes from road images and videos, tracks them across frames using ByteTrack, estimates severity, calculates road-risk scores, and helps prioritize road maintenance.

### AI Pipeline

```
Road Image/Video Input
        ↓
Preprocessing + Frame Extraction
        ↓
YOLO-Based Pothole Detection
        ↓
ByteTrack Multi-Object Tracking
        ↓
Unique Pothole Counting
        ↓
Visual Severity Assessment
        ↓
Road-Risk Scoring
        ↓
Maintenance Prioritization
        ↓
Interactive Dashboard + Reports
```

---

## Project Structure

d:\Pothole\
├── frontend/              # React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/    # Sidebar, TopNav, Layout
│   │   ├── pages/         # All 9 application pages
│   │   ├── services/      # Axios API service layer
│   │   ├── types/         # TypeScript interfaces
│   │   └── utils/         # Helpers + demo data
│   └── package.json
│
├── backend/               # Python + FastAPI + YOLO + ByteTrack
│   ├── main.py            # FastAPI application
│   ├── weights/           # Pothole detection model weights
│   ├── uploads/           # Temporary upload storage
│   ├── outputs/           # Processed video/image outputs
│   └── requirements.txt
│
└── pothole/               # Custom YOLO11m Training Module & Research
    ├── pothole_training.ipynb # Kaggle training notebook (80 epochs)
    ├── best.pt            # Trained YOLO11m weights (40.5 MB, mAP50: 0.790)
    ├── Count_file.py      # Standalone video detection & ByteTrack counter
    ├── ui.py / ui2.py     # Streamlit testing interface
    └── readme.md          # Model training & evaluation documentation
```

---

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173**

### Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
API available at **http://localhost:8000**

### Using the batch scripts (Windows)

```
start_frontend.bat     ← starts Vite dev server
backend\start_backend.bat ← starts FastAPI server
```

---

## Application Pages

| Page | Route | Description |
|------|-------|-------------|
| Overview Dashboard | `/` | KPI cards, charts, recent detections |
| Pothole Detection | `/detection` | Image upload + YOLO analysis |
| Video Analysis | `/video` | Video upload + ByteTrack tracking |
| Severity & Risk | `/analytics` | Charts + detailed results table |
| Road Monitoring | `/monitoring` | Road source cards + map placeholder |
| Maintenance | `/maintenance` | Priority groups + status management |
| Reports & Exports | `/reports` | CSV + PDF export |
| Dataset & Model | `/model` | Model info + pipeline description |
| Settings | `/settings` | Configuration panel |

---

## Connecting Real YOLO Weights

1. Model weights are trained using Ultralytics YOLO11 on the custom pothole dataset
2. Model weights (`best.pt`, 40.5 MB) are located in `pothole/best.pt` and `backend/weights/`
3. Start the backend: `uvicorn main:app --reload`
4. The system automatically performs live inference using the custom-trained weights

---

## 🧠 Custom YOLO11m Model Training & Benchmark Results

The final pothole detection vision model was trained using Ultralytics YOLO11m on the combined train+val dataset and evaluated on an untouched, independent test split.

### Final Training Specifications (`y11m_800_final_trainval_s42`)
- **Dataset**: `POTHOLE_V1_FINAL` (1,263 images train+val combined, filtered clean JPEG cache in RAM)
- **Model Architecture**: Ultralytics YOLO11m (231 layers unfused, 125 layers fused, 20,030,803 parameters, 67.8 GFLOPs)
- **Optimizer & Schedule**: AdamW (`lr0=0.0005`, `momentum=0.937`, `weight_decay=0.0005`, cosine LR schedule)
- **Augmentation Pipeline**: Mosaic (`1.0`), Mixup (`0.15`), Scale (`0.6`), Degrees (`5.0`), Albumentations (Blur, MedianBlur, ToGray, CLAHE)
- **Hardware Acceleration**: Kaggle Tesla T4 GPU (14,912 MiB VRAM), PyTorch 2.11 + CUDA 12.8, Automatic Mixed Precision (AMP)
- **Training Time**: 80 epochs completed in 1.114 hours (67.4 minutes)
- **Exported Weights**: 40.5 MB optimizer-stripped (`best.pt` / `y11m_800_final_trainval_s42.pt`)

### 🏆 Independent Test Set Evaluation (`POTHOLE_V1/test`)
Evaluated on **185 independent, untouched test images** containing **713 ground-truth pothole instances**:

| Metric | Score / Result | Percentage | Benchmark Assessment |
|---|---|---|---|
| **mAP@50** | **0.8032** | **80.32%** | Outstanding detection precision at standard IoU 0.50 |
| **mAP@50-95** | **0.4872** | **48.72%** | High localization accuracy across multi-IoU thresholds (0.50–0.95) |
| **Precision (P)** | **0.8301** | **83.01%** | Very low false alarm rate on complex road textures |
| **Recall (R)** | **0.6920** | **69.20%** | Reliable capture rate on challenging road distress |
| **Inference Latency** | **28.7 ms** | — | **~35 FPS** real-time throughput on Tesla T4 |

#### Official Evaluation Log
```text
============================================================
INDEPENDENT TEST METRICS (185 images | 713 ground-truth boxes)
============================================================
                 Class     Images  Instances      Box(P          R      mAP50  mAP50-95)
                   all        185        713      0.830      0.692      0.803      0.487

Precision: 0.8301
Recall:    0.6920
mAP50:     0.8032
mAP50-95:  0.4872
Speed: 1.2ms preprocess, 28.7ms inference, 0.0ms loss, 2.0ms postprocess per image
```

---

## Technology Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (utility styling)
- Lucide React (icons)
- Recharts (data visualization)
- React Router v6 (navigation)
- Axios (API communication)
- jsPDF (PDF report generation)
- file-saver (CSV export)

### Backend
- Python 3.x
- FastAPI (REST API)
- Ultralytics YOLO (detection)
- OpenCV (image/video processing)
- ByteTrack (multi-object tracking)
- Uvicorn (ASGI server)

---

## Demo Mode

When YOLO weights are not available, the application runs in **Demo Mode**:
- All pages are fully functional with realistic sample data
- All demonstration data is clearly labeled
- Real analysis is never simulated without backend confirmation
- Switching to live mode only requires placing weights + starting the backend

---

## Important Scientific Notes

- **Severity assessment** is based on visual characteristics (detection area, confidence, tracking persistence) — not physical depth measurement
- **Risk scores** are configurable demonstration estimates based on available visual features
- **mAP@50 of 90%** is the project training target, not an achieved result until validated evaluation
- All sample metrics are clearly labeled as demonstration data

---

*Final Year Engineering Project — Computer Vision / AI Infrastructure Monitoring*
