import { useState, useRef } from "react";
import "./App.css";

const BASE_URL = "http://127.0.0.1:8000";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${BASE_URL}/process`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to process file");
      }

      // Since backend returns image
      const blob = await res.blob();
      const imageUrl = URL.createObjectURL(blob);

      setResult({
        message: "Analysis completed successfully",
        graph: imageUrl,
      });

    } catch (err) {
      console.error(err);
      setResult({ message: `Error: ${err.message}` });
    }

    setLoading(false);
  };

  const clearFile = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-primary/30 selection:text-white">
      
      {/* Header Section */}
      <div className="w-full max-w-4xl space-y-4 text-center mt-8 mb-12 animate-fade-in-down">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-text-main drop-shadow-sm">
          OCR Data <span className="text-primary transparent bg-clip-text">Analyzer</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-text-muted">
          Transform your physical documents into actionable digital data. Upload receipts, invoices, or simple text to extract data seamlessly.
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-4xl bg-dark-surface backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-6 md:p-10 transition-all duration-300">
        
        {/* Dropzone */}
        <div 
          className={`relative group flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all duration-300
            ${file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-dark-surface/50'}
          `}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            onChange={(e) => setFile(e.target.files[0])} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            accept="image/*,.pdf"
          />

          <div className="flex flex-col items-center justify-center pointer-events-none text-center px-4">
            {file ? (
              <div className="flex flex-col items-center space-y-3 animate-fade-in">
                <div className="p-4 bg-primary/20 rounded-full text-primary">
                  ✔
                </div>
                <div>
                  <p className="text-lg font-semibold text-text-main">{file.name}</p>
                  <p className="text-sm text-text-muted">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <p className="text-lg text-text-muted font-medium">
                  <span className="text-primary">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-text-muted/70">
                  PNG, JPG, PDF up to 10MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          {file && (
            <button 
              onClick={clearFile}
              className="px-6 py-3 rounded-lg font-semibold text-text-main bg-transparent border border-border hover:bg-border/50"
            >
              Clear File
            </button>
          )}
          
          <button 
            onClick={handleUpload}
            disabled={loading || !file}
            className={`px-8 py-3 rounded-lg font-bold text-lg ${
              loading || !file 
              ? "bg-border text-text-muted cursor-not-allowed" 
              : "bg-primary text-white"
            }`}
          >
            {loading ? "Analyzing..." : "Analyze Document"}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="w-full max-w-5xl mt-12 space-y-8">

          <div className="p-4 rounded-xl border">
            <p>{result.message}</p>
          </div>

          {result.graph && (
            <div className="p-6 flex justify-center">
              <img
                src={result.graph}
                alt="Graph"
                className="max-w-full h-auto"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;