import os
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

def text_to_dataframe(text):
    lines = text.split("\n")
    data = []

    for line in lines:
        parts = line.split()
        if len(parts) == 2:
            name, value = parts
            if value.isdigit():
                data.append([name, int(value)])

    df = pd.DataFrame(data, columns=["Name", "Value"])
    return df


def generate_graph(df):
    import os
    import uuid
    import glob

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Cleanup old graphs to avoid storage bloating
    for old_file in glob.glob(os.path.join(UPLOAD_DIR, "graph_*.png")):
        try:
            os.remove(old_file)
        except OSError:
            pass

    unique_filename = f"graph_{uuid.uuid4().hex}.png"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    plt.figure()
    df.plot(x="Name", y="Value", kind="bar")

    plt.tight_layout()
    plt.savefig(file_path, bbox_inches='tight')
    plt.close()

    print("Graph saved at:", file_path)  # DEBUG

    return file_path