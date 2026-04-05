from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Keep imports lightweight at top
from server.analyzer import text_to_dataframe, generate_graph
from server.ocr import extract_text

app = FastAPI()

# CORS (update later with your frontend URL)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Health / Root Route (IMPORTANT)
# -------------------------------
@app.get("/")
def home():
    return {"status": "ok", "message": "OCR Analyzer API Running 🚀"}


@app.get("/health")
def health():
    return {"status": "healthy"}


# -------------------------------
# Upload Endpoint (IN-MEMORY)
# -------------------------------
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Read file into memory
        content = await file.read()

        if not content:
            raise HTTPException(status_code=400, detail="Empty file uploaded")

        # -----------------------
        # OCR Processing
        # -----------------------
        text = extract_text(content)

        if not text or not text.strip():
            return JSONResponse({
                "message": "No text detected",
                "text": ""
            })

        # -----------------------
        # Convert to DataFrame
        # -----------------------
        df = text_to_dataframe(text)

        # -----------------------
        # Generate Graph (IN-MEMORY)
        # -----------------------
        if not df.empty:
            image_base64 = generate_graph(df)

            return JSONResponse({
                "message": "Structured data detected",
                "text": text,
                "table": df.to_dict(orient="records"),
                "graph": f"data:image/png;base64,{image_base64}"
            })

        # -----------------------
        # Plain Text Response
        # -----------------------
        return JSONResponse({
            "message": "Plain text (no structured data found)",
            "text": text
        })

    except Exception as e:
        print("ERROR:", str(e))  # logs visible on Render
        raise HTTPException(status_code=500, detail=str(e))