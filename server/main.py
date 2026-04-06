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
import os

# Initialize FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all (for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ FIX: Only set path on Windows
if os.name == "nt":
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


# -----------------------------
# IMAGE PREPROCESSING FUNCTION
# -----------------------------
def preprocess_image(image: Image.Image):
    img = np.array(image)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    gray = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

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
    try:
        print("🔥 REQUEST HIT /process")

        # Step 1: Read image
        image = Image.open(file.file)
        print("✅ Image loaded")

        # Step 2: Preprocess
        processed_image = preprocess_image(image)
        print("✅ Image preprocessed")

        # Step 3: OCR
        custom_config = r'--oem 3 --psm 6'
        text = pytesseract.image_to_string(processed_image, config=custom_config)
        print("✅ OCR done")
        print("📄 Extracted text:", text)

        # Step 4: Convert text → structured data
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

        print("✅ Data parsed:", data)

        # Step 5: Create DataFrame
        df = pd.DataFrame(data, columns=["Label", "Value"])

        # Step 6: Generate graph
        plt.figure()
        plt.bar(df["Label"], df["Value"])
        plt.xlabel("Label")
        plt.ylabel("Value")
        plt.title("Extracted Data Visualization")
        plt.tight_layout()

        # Step 7: Save graph to memory
        buffer = io.BytesIO()
        plt.savefig(buffer, format="png")
        buffer.seek(0)
        plt.close()

        print("✅ Graph generated")

        # Step 8: Return graph
        return StreamingResponse(buffer, media_type="image/png")

    except Exception as e:
        print("❌ ERROR OCCURRED:", str(e))
        return {"error": str(e)}