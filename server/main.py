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

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/")
def home():
    return {"message": "OCR Analyzer API Running 🚀"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)

        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Step 1: OCR
        text = extract_text(file_path)

        if not text.strip():
            return {
                "message": "No text detected",
                "text": ""
            }

        # Step 2: Try to structure data
        df = text_to_dataframe(text)

        # Step 3: If structured → graph
        if not df.empty:
            graph_path = generate_graph(df)

            return {
                "message": "Structured data detected",
                "text": text,
                "table": df.to_dict(orient="records"),
                "graph": f"/graph?timestamp={os.path.getmtime(graph_path)}"
            }

        # Step 4: If not structured → just text
        return {
            "message": "Plain text (no structured data found)",
            "text": text
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/graph")
def get_graph():
    graph_path = os.path.join(UPLOAD_DIR, "graph.png")

    if not os.path.exists(graph_path):
        raise HTTPException(status_code=404, detail="Graph not found")

    return FileResponse(graph_path)