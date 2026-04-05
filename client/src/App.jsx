import { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>📄 OCR Data Analyzer</h1>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <br /><br />

      <button onClick={handleUpload}>
        Upload & Analyze
      </button>

      {loading && <p>Processing...</p>}

      {result && (
        <div style={{ marginTop: "30px" }}>
          <h2>Result</h2>

          <p><b>Status:</b> {result.message}</p>

          <h3>Extracted Text:</h3>
          <pre>{result.text}</pre>

          {result.table && (
            <>
              <h3>Table:</h3>
              <table border="1" cellPadding="10">
                <thead>
                  <tr>
                    {result.table.length > 0 && Object.keys(result.table[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.table.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, j) => (
                        <td key={j}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {result.graph && (
            <>
              <h3>Graph:</h3>
              <img
                src={`http://127.0.0.1:8000${result.graph}`}
                alt="graph"
                width="400"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;