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
    plt.figure()
    df.plot(x="Name", y="Value", kind="bar")

    os.makedirs("uploads", exist_ok=True)
    file_path = os.path.join("uploads", "graph.png")
    plt.savefig(file_path)
    plt.close()

    return file_path