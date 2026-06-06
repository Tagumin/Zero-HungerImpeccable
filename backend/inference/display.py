import os
import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path

# ==========================================
# Configuration
# ==========================================
BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent
DATA_DIR = str(PROJECT_ROOT / 'dataset')
DOCS_IMAGES_DIR = PROJECT_ROOT / 'docs' / 'images'
SPLITS = ['train', 'valid', 'test']

print("Scanning directories...")
data = []

# ==========================================
# Count Images
# ==========================================
# Get the list of all disease classes from the train folder
class_names = sorted(os.listdir(os.path.join(DATA_DIR, 'train')))

for cls in class_names:
    row = {'Disease Class': cls}
    total = 0
    for split in SPLITS:
        folder_path = os.path.join(DATA_DIR, split, cls)
        if os.path.exists(folder_path):
            count = len(os.listdir(folder_path))
        else:
            count = 0
        row[f'{split.capitalize()} Count'] = count
        total += count
    
    row['Total'] = total
    data.append(row)

# ==========================================
# Build DataFrame & Plot
# ==========================================
df = pd.DataFrame(data)
df = df.sort_values(by='Total', ascending=True)

print("\nDataset Summary:")
print(df.to_string(index=False))

# Plotting a stacked horizontal bar chart
plt.figure(figsize=(14, 12))
df.set_index('Disease Class')[['Train Count', 'Valid Count', 'Test Count']].plot(
    kind='barh', 
    stacked=True, 
    figsize=(14, 12),
    color=['#2ca02c', '#1f77b4', '#ff7f0e'],
    edgecolor='black'
)

plt.xlabel('Number of Images', fontsize=12)
plt.ylabel('Plant Disease Class', fontsize=12)
plt.title('Dataset Distribution (Train / Valid / Test)', fontsize=14, fontweight='bold')
plt.legend(title='Dataset Split')
plt.grid(axis='x', linestyle='--', alpha=0.7)
plt.tight_layout()

DOCS_IMAGES_DIR.mkdir(parents=True, exist_ok=True)
chart_path = DOCS_IMAGES_DIR / 'dataset_distribution_3splits.png'
plt.savefig(chart_path, dpi=300)
print(f"\nChart successfully saved as '{chart_path}'")