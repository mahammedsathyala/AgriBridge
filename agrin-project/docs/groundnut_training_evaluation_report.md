# Groundnut Disease Classifier - Training & Evaluation Report

- **Architecture:** MobileNetV2 Transfer Learning
- **Total Dataset Size:** 3058 raw leaf images
- **Split Counts:** Train: 2140 (70%), Val: 459 (15%), Test: 459 (15%)
- **Overall Test Accuracy:** 72.77%
- **Weighted Precision:** 73.22%
- **Weighted Recall:** 72.77%
- **Weighted F1 Score:** 72.00%

## Per-Class Evaluation Metrics on Untouched Test Set

| Class Name | Precision | Recall | F1-Score | Support |
| :--- | :--- | :--- | :--- | :--- |
| `early_leaf_spot` | 64.9% | 54.1% | 59.0% | 133.0 |
| `healthy leaf` | 80.3% | 73.4% | 76.7% | 139.0 |
| `late leaf spot` | 68.2% | 97.1% | 80.2% | 104.0 |
| `nutrition deficiency` | 80.4% | 83.7% | 82.0% | 49.0 |
| `rust` | 81.8% | 52.9% | 64.3% | 34.0 |

## Model Artifact Locations

- **Keras Model Weights:** `c:\Users\satha\OneDrive\Desktop\AgriBridge\agrin-project\backend\model_weights\groundnut_disease.keras`
- **Class Names Mapping:** `c:\Users\satha\OneDrive\Desktop\AgriBridge\agrin-project\backend\model_weights\groundnut_class_names.json`
- **Confusion Matrix Plot:** `c:\Users\satha\OneDrive\Desktop\AgriBridge\agrin-project\docs\groundnut_confusion_matrix.png`
