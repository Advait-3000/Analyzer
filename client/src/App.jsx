import { useState, useRef } from "react";
import "./App.css";

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
      const res = await fetch("https://analyzer-604r.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to upload and analyze");
      }

      setResult(data);
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

      {/* Main Card (Glassmorphism) */}
      <div className="w-full max-w-4xl bg-dark-surface backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-6 md:p-10 transition-all duration-300">
        
        {/* Dropzone Area */}
        <div 
          className={`relative group flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all duration-300
            ${file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-dark-surface/50'}
          `}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            onChange={(e) => setFile(e.target.files[0])} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 file-upload-input"
            accept="image/*,.pdf"
          />
          
          <div className="flex flex-col items-center justify-center pointer-events-none text-center px-4">
            {file ? (
              <div className="flex flex-col items-center space-y-3 animate-fade-in">
                <div className="p-4 bg-primary/20 rounded-full text-primary">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                  <p className="text-lg font-semibold text-text-main">{file.name}</p>
                  <p className="text-sm text-text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className="p-4 bg-border/30 rounded-full text-text-muted group-hover:text-primary transition-colors duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                </div>
                <p className="text-lg text-text-muted font-medium"><span className="text-primary group-hover:underline">Click to upload</span> or drag and drop</p>
                <p className="text-sm text-text-muted/70">PNG, JPG, PDF up to 10MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          {file && (
            <button 
              onClick={clearFile}
              className="px-6 py-3 rounded-lg font-semibold text-text-main bg-transparent border border-border hover:bg-border/50 transition-colors"
            >
              Clear File
            </button>
          )}
          
          <button 
            onClick={handleUpload}
            disabled={loading || !file}
            className={`flex items-center justify-center px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 shadow-lg ${
              loading || !file 
              ? "bg-border text-text-muted cursor-not-allowed opacity-70" 
              : "bg-primary hover:bg-primary-hover text-white hover:shadow-primary/30 hover:-translate-y-0.5"
            }`}
          >
            {loading ? (
              <>
                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 Analyzing...
              </>
            ) : "Analyze Document"}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="w-full max-w-5xl mt-12 space-y-8 animate-fade-in-up">
          
          {/* Status Message */}
          <div className={`p-4 rounded-xl border flex items-center gap-3 shadow-lg ${result.message && result.message.startsWith('Error') ? 'bg-red-900/10 border-red-500/50 text-red-200' : 'bg-primary/10 border-primary/30 text-text-main'}`}>
            <div className={`p-1.5 rounded-full ${result.message && result.message.startsWith('Error') ? 'bg-red-500/20 text-red-400' : 'bg-primary/20 text-primary'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <p className="font-medium text-lg">{result.message}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Extracted Text Column */}
            {result.text && (
              <div className="flex flex-col bg-dark-surface backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-xl lg:col-span-2">
                <div className="px-6 py-4 border-b border-border bg-black/20 flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-text-main flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Extracted Text
                  </h3>
                  <button onClick={() => navigator.clipboard.writeText(result.text)} className="text-text-muted hover:text-primary transition-colors text-sm font-medium">Copy Text</button>
                </div>
                <div className="p-6 overflow-x-auto max-h-[500px] overflow-y-auto">
                  <pre className="font-mono text-sm text-text-muted whitespace-pre-wrap leading-relaxed">{result.text}</pre>
                </div>
              </div>
            )}

            {/* Extracted Table */}
            {result.table && result.table.length > 0 && (
              <div className="flex flex-col bg-dark-surface backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-xl lg:col-span-2">
                 <div className="px-6 py-4 border-b border-border bg-black/20">
                  <h3 className="text-xl font-semibold text-text-main flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    Data Table
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black/10 border-b border-border text-sm text-text-muted uppercase tracking-wider">
                        {Object.keys(result.table[0]).map((key, index) => (
                          <th key={key} className="px-6 py-4 font-semibold">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {result.table.map((row, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors duration-200">
                          {Object.values(row).map((val, j) => (
                            <td key={j} className="px-6 py-4 text-text-main text-sm whitespace-nowrap">{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Visual Graph */}
            {result.graph && (
              <div className="flex flex-col bg-dark-surface backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-xl lg:col-span-2">
                 <div className="px-6 py-4 border-b border-border bg-black/20">
                  <h3 className="text-xl font-semibold text-text-main flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
                    Data Visualization
                  </h3>
                </div>
                <div className="p-6 flex justify-center bg-white/5">
                  <div className="bg-white rounded-xl shadow-inner border border-border/20 p-2 max-w-full overflow-hidden inline-block">
                    <img
                      src={`http://127.0.0.1:8000${result.graph}`}
                      alt="Extracted Data Graph"
                      className="max-w-full h-auto rounded-lg object-contain mix-blend-multiply"
                    />
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="w-full max-w-4xl mt-auto pt-16 pb-8 text-center text-text-muted text-sm flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        Secure & Private OCR processing run locally.
      </footer>
    </div>
  );
}

export default App;