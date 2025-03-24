import pandas as pd

file_path = "train.csv"  
df = pd.read_csv(file_path)

df_cleaned = df.dropna(subset=['Context', 'Response'])
df_cleaned = df_cleaned.copy()

df_cleaned.to_csv("cleaned_train1.csv", index=False)

print("Data cleaned and saved as cleaned_train.csv!")
