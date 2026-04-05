from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os

from server.ocr import extract_text
from server.analyzer import text_to_dataframe, generate_graph

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Removed disk writes per refactoring to purely in-memory architecture
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


@app.get("/")
def home():
    return {"message": "OCR Analyzer API Running 🚀"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Read the file directly into memory
        content = await file.read()

        # Step 1: OCR
        text = extract_text(content)

        if not text.strip():
            return {
                "message": "No text detected",
                "text": ""
            }

        # Step 2: Try to structure data
        df = text_to_dataframe(text)

        # Step 3: If structured → graph
        if not df.empty:
            image_base64 = generate_graph(df)

            return {
                "message": "Structured data detected",
                "text": text,
                "table": df.to_dict(orient="records"),
                "graph": f"data:image/png;base64,{image_base64}"
            }

        # Step 4: If not structured → just text
        return {
            "message": "Plain text (no structured data found)",
            "text": text
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

