import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import sys
import os

from src.model import CNNClassifier
from src.dataloader import get_dataloaders

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

_, _, classes = get_dataloaders("data/dataset", batch_size=1)

model = CNNClassifier(num_classes=len(classes)).to(device)
model.load_state_dict(torch.load("models/best_model.pth", map_location=device))
model.eval()

transform = transforms.Compose([
    transforms.Resize((64, 64)),  # must match training size
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,))  # same as dataloader
])

def predict_image(image_path):
    image = Image.open(image_path).convert("RGB")
    image = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(image)
        _, predicted = torch.max(outputs, 1)
        predicted_class = classes[predicted.item()]

    return predicted_class

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python src/inference.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]

    if not os.path.exists(image_path):
        print(f"Error: {image_path} does not exist")
        sys.exit(1)

    pred_class = predict_image(image_path)
    print(f"Predicted class: {pred_class}")