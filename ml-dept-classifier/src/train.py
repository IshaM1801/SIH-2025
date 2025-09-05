import torch
import torch.nn as nn
import torch.optim as optim
from model import SimpleCNN
from dataloader import get_dataloaders

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

train_loader, val_loader, classes = get_dataloaders("data/dataset", batch_size=4)
model = SimpleCNN(num_classes=len(classes)).to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

epochs = 20
for epoch in range(epochs):
    model.train()
    running_loss, correct, total = 0.0, 0, 0
    for images, labels in train_loader:
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item()
        _, preds = torch.max(outputs, 1)
        correct += (preds == labels).sum().item()
        total += labels.size(0)

    print(f"Epoch [{epoch+1}/{epochs}] "
          f"Train Loss: {running_loss/len(train_loader):.4f}, "
          f"Train Acc: {100*correct/total:.2f}%")

    # Validation
    model.eval()
    val_loss, val_correct, val_total = 0.0, 0, 0
    with torch.no_grad():
        for images, labels in val_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)
            val_loss += loss.item()
            _, preds = torch.max(outputs, 1)
            val_correct += (preds == labels).sum().item()
            val_total += labels.size(0)

    print(f"Val Loss: {val_loss/len(val_loader):.4f}, "
          f"Val Acc: {100*val_correct/val_total:.2f}%")
import os
os.makedirs("../models", exist_ok=True)  # ensures folder exists
torch.save(model.state_dict(), "../models/best_model.pth")