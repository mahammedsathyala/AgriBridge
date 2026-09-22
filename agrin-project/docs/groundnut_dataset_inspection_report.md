# Groundnut Leaf Dataset Inspection & Validation Report
**Target Directory:** `c:\Users\satha\OneDrive\Desktop\AgriBridge\datasets\groundnut`

## 1. Directory Structure Overview
- `📁 Groundnut_Leaf_dataset` (Directory)
- `📄 Groundnut_Leaf_dataset.zip` (114290.3 KB)
- `📄 Metadata.xlsx` (304.9 KB)
- `📁 Raw_Data` (Directory)

## 2. Raw Data Analysis (`Raw_Data/`)
**Identified Classes (5):**
- **Total Raw Images:** 3058

### Class Distribution:
| Class Name | Image Count | Percentage | Imbalance Ratio (vs Min) |
| :--- | :--- | :--- | :--- |
| `healthy leaf` | 929 | 30.38% | 4.11x |
| `early_leaf_spot` | 885 | 28.94% | 3.92x |
| `late leaf spot` | 689 | 22.53% | 3.05x |
| `nutrition deficiency` | 329 | 10.76% | 1.46x |
| `rust` | 226 | 7.39% | 1.00x |

### Image Formats:
- **JPEG**: 3058 images (100.0%)

### Image Dimensions (Sample Top Resolutions):
- `1200x800` px: 3058 images (100.0%)

### Data Integrity & Corruption:
- **Corrupted / Unreadable Images:** 0
  - ✅ All images successfully validated and decoded without corruption.

### Duplicate Images (SHA256 Hash Collisions):
- **Duplicate Hash Groups:** 0
  - ✅ No exact duplicate files detected across raw classes.

## 3. Pre-Split Folder Analysis (`Groundnut_Leaf_dataset/`)
### Split `train` (7910 total images):
- `early_leaf_spot_1`: 1322 images
- `early_rust_1`: 1065 images
- `healthy_leaf_1`: 1462 images
- `late_leaf_spot_1`: 1491 images
- `nutrition_deficiency_1`: 1255 images
- `rust_1`: 1315 images
### Split `test` (2451 total images):
- `early_leaf_spot_1`: 409 images
- `early_rust_1`: 409 images
- `healthy_leaf_1`: 409 images
- `late_leaf_spot_1`: 405 images
- `nutrition_deficiency_1`: 410 images
- `rust_1`: 409 images

## 4. Annotation Format Assessment
- **PASCAL VOC XML annotations:** 0
- **YOLO format TXT annotations:** 0
- **COCO JSON annotations:** 0
- **Tabular Metadata:** `Metadata.xlsx` present containing file IDs and disease classification labels.

**Determination:** The dataset is a pure **Image Classification** dataset with folder-based and tabular categorical class labels. There are **no bounding-box annotations**. Therefore, high-accuracy **Deep Learning Image Classification (Transfer Learning)** is the correct and appropriate vision architecture.