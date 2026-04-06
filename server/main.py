from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import pytesseract
import pandas as pd
import matplotlib.pyplot as plt
import io
import cv2
import numpy as np

# Initialize FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all (for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# IMPORTANT (for Windows)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


# -----------------------------
# IMAGE PREPROCESSING FUNCTION
# -----------------------------
def preprocess_image(image: Image.Image):
    # Convert PIL → OpenCV format
    img = np.array(image)

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Resize (improves OCR accuracy)
    gray = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

    # Apply threshold
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)

    return thresh


# -----------------------------
# 1. GET ROUTE (Health Check)
# -----------------------------
@app.get("/")
def root():
    return {"message": "Backend is working 🚀"}


# -----------------------------
# 2. POST ROUTE (Full Pipeline)
# -----------------------------
@app.post("/process")
async def process(file: UploadFile = File(...)):
    
    # Step 1: Read image
    image = Image.open(file.file)

    # 🔥 NEW: Preprocess image
    processed_image = preprocess_image(image)

    # 🔥 NEW: Better OCR config
    custom_config = r'--oem 3 --psm 6'

    # Step 2: OCR → Extract text
    text = pytesseract.image_to_string(processed_image, config=custom_config)

    # Step 3: Convert text → structured data (UNCHANGED)
    lines = text.strip().split("\n")
    data = []

    for line in lines:
        parts = line.split()
        if len(parts) == 2:
            try:
                label = parts[0]
                value = float(parts[1])
                data.append((label, value))
            except:
                continue

    # Step 4: Create DataFrame (UNCHANGED)
    df = pd.DataFrame(data, columns=["Label", "Value"])

    # Step 5: Generate graph (UNCHANGED)
    plt.figure()
    plt.bar(df["Label"], df["Value"])
    plt.xlabel("Label")
    plt.ylabel("Value")
    plt.title("Extracted Data Visualization")
    plt.tight_layout()

    # Step 6: Save graph to memory (UNCHANGED)
    buffer = io.BytesIO()
    plt.savefig(buffer, format="png")
    buffer.seek(0)
    plt.close()

    # Step 7: Return graph as response (UNCHANGED)
    return StreamingResponse(buffer, media_type="image/png")