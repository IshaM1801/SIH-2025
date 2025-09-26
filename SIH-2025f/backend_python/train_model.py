from ultralytics import YOLO
import os

# This script trains a YOLOv8 model on a custom dataset.
# Before running, make sure you have downloaded a dataset
# and have the path to its 'data.yaml' file.

def train_pothole_detector():
    """
    Loads a pre-trained YOLOv8 model and fine-tunes it on a custom dataset.
    """
    print("Loading pre-trained YOLOv8 model...")
    # 'yolov8n.pt' is the smallest and fastest model, perfect for a hackathon.
    model = YOLO('yolov8n.pt')

# '/Users/indrajeetsinghbava/Downloads/Pothole detection.v1i.yolov8/data.yaml'

    print("Starting model training...")
    # --- This path is now correct based on your folder name ---
    dataset_yaml_path = os.path.join('dataset', 'PotholeDetection.v1i.yolov8', 'data.yaml')

    try:
        results = model.train(
            data=dataset_yaml_path,
            epochs=30,  # 30 epochs is a good balance for speed and accuracy
            imgsz=640,  # Standard image size for this model
            project='training_results', # Saves results in a new folder
            name='pothole_detector'
        )
        print("Training complete!")
        print("Your trained model is saved in 'training_results/pothole_detector/weights/best.pt'")
        print("Please COPY 'best.pt' into the main 'sih_python_backend' folder.")

    except Exception as e:
        print(f"An error occurred during training: {e}")
        print(f"Please ensure the path '{dataset_yaml_path}' is correct and the folder has been moved.")

if __name__ == '__main__':
    train_pothole_detector()