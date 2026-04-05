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

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    file_path = os.path.join(UPLOAD_DIR, "graph.png")

    plt.figure()
    df.plot(x="Name", y="Value", kind="bar")

    plt.tight_layout()
    plt.savefig(file_path, bbox_inches='tight')
    plt.close()

    print("Graph saved at:", file_path)  # DEBUG

    return file_path