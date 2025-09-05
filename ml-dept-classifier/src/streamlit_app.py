import streamlit as st
import requests
from PIL import Image

API_URL = "http://127.0.0.1:8000/predict"  # FastAPI endpoint

st.title("Civic Issue Department Classifier")
st.write("Upload an image to categorize it into one of the civic departments.")

uploaded_file = st.file_uploader("Upload an Image", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    image = Image.open(uploaded_file).convert("RGB")
    st.image(image, caption="Uploaded Image", use_container_width=True)

    if st.button("Predict Department"):
        with st.spinner("Classifying..."):
            try:
                files = {"file": (uploaded_file.name, uploaded_file, "image/jpeg")}
                response = requests.post(API_URL, files=files)
                data = response.json()

                if response.status_code == 200:
                    st.success(f"Prediction: **{data['predicted_class'].upper()}**")
                    st.write(f"Confidence: {data['confidence']}%")
                else:
                    st.error(f"Error: {data.get('error')}")
            except Exception as e:
                st.error(f"Request failed: {e}")