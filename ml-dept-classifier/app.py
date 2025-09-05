from fastapi import FastAPI
from pydantic import BaseModel
import requests
from PIL import Image
import io
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from src.model import CNNClassifier

# ---------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------
app = FastAPI()

# ---------------------------------------------------------
# Device & Model Setup
# ---------------------------------------------------------
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MODEL_PATH = "models/best_model.pth"
CLASS_NAMES = ["roads", "sanitation", "electricity", "water", "other"]

# Load trained CNN model
model = CNNClassifier(num_classes=len(CLASS_NAMES))
model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model.to(DEVICE)
model.eval()

# ---------------------------------------------------------
# Image Transformations
# ---------------------------------------------------------
transform = transforms.Compose([
    transforms.Resize((64, 64)),
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,))
])

# ---------------------------------------------------------
# Request Body Schema
# ---------------------------------------------------------
class UrlRequest(BaseModel):
    image_url: str

# ---------------------------------------------------------
# Root Check
# ---------------------------------------------------------
@app.get("/")
def root():
    return {"message": "Civic Issue Department Classifier API running 🚀"}

# ---------------------------------------------------------
# Predict from URL
# ---------------------------------------------------------
@app.post("/predict_url")
async def predict_url(req: UrlRequest):
    try:
        # Clean URL
        image_url = req.image_url.strip()
        print("Fetching:", image_url)

        # Fetch image
        response = requests.get(image_url)
        response.raise_for_status()

        # Load image
        image = Image.open(io.BytesIO(response.content)).convert("RGB")
        img_tensor = transform(image).unsqueeze(0).to(DEVICE)

        # Inference
        with torch.no_grad():
            outputs = model(img_tensor)
            probs = nn.Softmax(dim=1)(outputs)
            conf, pred_idx = torch.max(probs, 1)

        predicted_class = CLASS_NAMES[pred_idx.item()]
        confidence = round(conf.item() * 100, 2)

        return {
            "predicted_class": predicted_class,
            "confidence": confidence,
            "source_url": image_url
        }

    except Exception as e:
        return {"error": str(e)}