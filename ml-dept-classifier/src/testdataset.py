# src/test_dataset.py
from dataloader import get_dataloaders

if __name__ == "__main__":
    train_loader, val_loader, classes = get_dataloaders("data/dataset", batch_size=4)
    print("Classes:", classes)

    # Take one batch
    images, labels = next(iter(train_loader))
    print("Image batch shape:", images.shape)
    print("Label batch:", labels)