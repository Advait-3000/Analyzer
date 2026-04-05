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
    import io
    import base64

    ax = df.plot(x="Name", y="Value", kind="bar")
fig = ax.get_figure()
    plt.tight_layout()

    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches='tight')
    plt.close()
    
    buf.seek(0)
    image_base64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return image_base64