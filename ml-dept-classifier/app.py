import streamlit as st
from PIL import Image
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from src.model import CNNClassifier 


DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MODEL_PATH = "models/best_model.pth" 
CLASS_NAMES = ["roads", "sanitation", "electricity", "water", "other"]

@st.cache_resource
def load_model():
    model = CNNClassifier(num_classes=len(CLASS_NAMES)) 
    model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
    model.to(DEVICE)
    model.eval()
    return model

model = load_model()

transform = transforms.Compose([
    transforms.Resize((64, 64)),
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,))
])

st.title("Civic Issue Department Classifier")
st.write("Upload an image to categorize it into one of the civic departments.")

uploaded_file = st.file_uploader("Upload an Image", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    image = Image.open(uploaded_file).convert("RGB")
    st.image(image, caption="Uploaded Image", use_container_width=True)

    img_tensor = transform(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        outputs = model(img_tensor)
        probs = nn.Softmax(dim=1)(outputs)
        conf, pred_idx = torch.max(probs, 1)

    predicted_class = CLASS_NAMES[pred_idx.item()]
    confidence = conf.item() * 100

    st.subheader(f"Prediction: **{predicted_class.upper()}**")
    # st.write(f"Confidence: {confidence:.2f}%")