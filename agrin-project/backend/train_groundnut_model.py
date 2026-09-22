"""
AgriBridge Groundnut Leaf Disease Classifier - Training Pipeline
-----------------------------------------------------------------
Architecture: Transfer Learning with MobileNetV2 / EfficientNet
Splits: 70% Train, 15% Validation, 15% Test (Reproducible Stratified Split)
Data Augmentation & Class Weight Imbalance Handling
Generates: Accuracy, Precision, Recall, F1, Confusion Matrix, and saves weights.
"""

import os
import json
import random
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

# Ensure reproducible splits
SEED = 42
random.seed(SEED)
np.random.seed(SEED)

def train_groundnut_classifier():
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras import layers
    from sklearn.model_selection import train_test_split
    from sklearn.utils.class_weight import compute_class_weight
    from sklearn.metrics import classification_report, confusion_matrix, precision_recall_fscore_support

    tf.random.set_seed(SEED)

    raw_data_dir = r"c:\Users\satha\OneDrive\Desktop\AgriBridge\datasets\groundnut\Raw_Data"
    if not os.path.exists(raw_data_dir):
        # Fallback to direct path
        raw_data_dir = r"c:\Users\satha\OneDrive\Desktop\AgriBridge\dataset\Dataset of groundnut plant leaf images for classification and detection\Raw_Data"

    print(f"Loading dataset from: {raw_data_dir}")

    # Gather all filepaths and labels
    classes = sorted([d for d in os.listdir(raw_data_dir) if os.path.isdir(os.path.join(raw_data_dir, d))])
    class_to_idx = {cls_name: i for i, cls_name in enumerate(classes)}
    idx_to_class = {i: cls_name for i, cls_name in enumerate(classes)}

    filepaths = []
    labels = []

    for c in classes:
        c_dir = os.path.join(raw_data_dir, c)
        for fname in os.listdir(c_dir):
            if fname.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                filepaths.append(os.path.join(c_dir, fname))
                labels.append(class_to_idx[c])

    filepaths = np.array(filepaths)
    labels = np.array(labels)
    total_samples = len(labels)
    print(f"Total verified samples: {total_samples} across {len(classes)} classes: {classes}")

    # 70% Train, 15% Val, 15% Test with stratification
    train_files, test_val_files, train_labels, test_val_labels = train_test_split(
        filepaths, labels, test_size=0.30, random_state=SEED, stratify=labels
    )
    val_files, test_files, val_labels, test_labels = train_test_split(
        test_val_files, test_val_labels, test_size=0.50, random_state=SEED, stratify=test_val_labels
    )

    print(f"Splits -> Train: {len(train_files)} ({len(train_files)/total_samples*100:.1f}%), "
          f"Validation: {len(val_files)} ({len(val_files)/total_samples*100:.1f}%), "
          f"Test: {len(test_files)} ({len(test_files)/total_samples*100:.1f}%)")

    # Compute class weights for imbalanced classes
    class_weights_arr = compute_class_weight(
        class_weight="balanced",
        classes=np.unique(train_labels),
        y=train_labels
    )
    class_weight_dict = {i: float(w) for i, w in enumerate(class_weights_arr)}
    print(f"Computed Class Weights: {class_weight_dict}")

    # Image loading and preprocessing
    IMG_SIZE = (224, 224)
    BATCH_SIZE = 32

    def parse_image(filepath, label):
        img_bytes = tf.io.read_file(filepath)
        img = tf.image.decode_jpeg(img_bytes, channels=3)
        img = tf.image.resize(img, IMG_SIZE)
        return img, label

    train_ds = tf.data.Dataset.from_tensor_slices((train_files, train_labels))
    train_ds = train_ds.shuffle(buffer_size=1024, seed=SEED).map(parse_image, num_parallel_calls=tf.data.AUTOTUNE)
    train_ds = train_ds.batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)

    val_ds = tf.data.Dataset.from_tensor_slices((val_files, val_labels))
    val_ds = val_ds.map(parse_image, num_parallel_calls=tf.data.AUTOTUNE)
    val_ds = val_ds.batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)

    test_ds = tf.data.Dataset.from_tensor_slices((test_files, test_labels))
    test_ds = test_ds.map(parse_image, num_parallel_calls=tf.data.AUTOTUNE)
    test_ds = test_ds.batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)

    # Data augmentation block
    data_augmentation = keras.Sequential([
        layers.RandomFlip("horizontal_and_vertical"),
        layers.RandomRotation(0.15),
        layers.RandomZoom(0.15),
        layers.RandomContrast(0.1),
    ], name="data_augmentation")

    # Base transfer learning model
    base_model = keras.applications.MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights="imagenet"
    )
    base_model.trainable = False  # Freeze base during phase 1

    inputs = keras.Input(shape=(224, 224, 3), name="input_image")
    x = data_augmentation(inputs)
    x = keras.applications.mobilenet_v2.preprocess_input(x)
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(128, activation="relu")(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(len(classes), activation="softmax", name="predictions")(x)

    model = keras.Model(inputs, outputs, name="AgriBridge_Groundnut_Classifier")

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-3),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )
    model.summary()

    output_model_dir = r"c:\Users\satha\OneDrive\Desktop\AgriBridge\agrin-project\backend\model_weights"
    os.makedirs(output_model_dir, exist_ok=True)
    keras_model_path = os.path.join(output_model_dir, "groundnut_disease.keras")
    class_names_path = os.path.join(output_model_dir, "groundnut_class_names.json")

    callbacks = [
        keras.callbacks.EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True, verbose=1),
        keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=3, min_lr=1e-6, verbose=1),
        keras.callbacks.ModelCheckpoint(filepath=keras_model_path, monitor="val_accuracy", save_best_only=True, verbose=1)
    ]

    print("\n--- Training Phase 1: Transfer Learning Head ---")
    history_phase1 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=15,
        class_weight=class_weight_dict,
        callbacks=callbacks
    )

    # Phase 2: Fine-tuning top layers
    print("\n--- Training Phase 2: Fine Tuning Top Layers ---")
    base_model.trainable = True
    # Freeze the bottom 100 layers and fine tune the remaining
    for layer in base_model.layers[:100]:
        layer.trainable = False

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-4),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    history_phase2 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=10,
        class_weight=class_weight_dict,
        callbacks=callbacks
    )

    # Save final best model
    model.save(keras_model_path)
    print(f"\nModel successfully saved to: {keras_model_path}")

    # Save class names JSON
    class_metadata = {
        "classes": classes,
        "class_to_idx": class_to_idx,
        "idx_to_class": {str(k): v for k, v in idx_to_class.items()},
        "num_classes": len(classes),
        "input_shape": [224, 224, 3],
        "model_architecture": "MobileNetV2 Transfer Learning",
        "created_at": "2026-09-22"
    }
    with open(class_names_path, "w", encoding="utf-8") as f:
        json.dump(class_metadata, f, indent=2)
    print(f"Class names saved to: {class_names_path}")

    # Untouched Test Set Evaluation
    print("\n==========================================")
    print("Evaluating on Untouched Test Set (15%)...")
    print("==========================================")

    test_loss, test_acc = model.evaluate(test_ds, verbose=1)
    print(f"Test Loss: {test_loss:.4f} | Test Accuracy: {test_acc:.4f} ({test_acc*100:.2f}%)")

    # Predict test set
    y_pred_probs = model.predict(test_ds)
    y_pred = np.argmax(y_pred_probs, axis=1)

    # Metrics
    report_dict = classification_report(test_labels, y_pred, target_names=classes, output_dict=True)
    report_text = classification_report(test_labels, y_pred, target_names=classes)
    cm = confusion_matrix(test_labels, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(test_labels, y_pred, average="weighted")

    print("\nTest Classification Report:")
    print(report_text)

    # Plot Confusion Matrix
    cm_dir = r"c:\Users\satha\OneDrive\Desktop\AgriBridge\agrin-project\docs"
    os.makedirs(cm_dir, exist_ok=True)
    cm_plot_path = os.path.join(cm_dir, "groundnut_confusion_matrix.png")

    fig, ax = plt.subplots(figsize=(8, 6))
    im = ax.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    ax.figure.colorbar(im, ax=ax)
    ax.set(xticks=np.arange(cm.shape[1]),
           yticks=np.arange(cm.shape[0]),
           xticklabels=classes, yticklabels=classes,
           title=f'Groundnut Disease Confusion Matrix\nTest Accuracy: {test_acc*100:.2f}%',
           ylabel='True Disease Class',
           xlabel='Predicted Disease Class')
    plt.setp(ax.get_xticklabels(), rotation=30, ha="right", rotation_mode="anchor")

    # Annotate values
    thresh = cm.max() / 2.
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            ax.text(j, i, format(cm[i, j], 'd'),
                    ha="center", va="center",
                    color="white" if cm[i, j] > thresh else "black")
    fig.tight_layout()
    plt.savefig(cm_plot_path, dpi=300)
    plt.close()
    print(f"Confusion matrix plot saved to: {cm_plot_path}")

    # Save comprehensive evaluation report
    eval_results = {
        "dataset_path": raw_data_dir,
        "total_images": total_samples,
        "classes": classes,
        "splits": {
            "train_count": len(train_files),
            "validation_count": len(val_files),
            "test_count": len(test_files)
        },
        "model_architecture": "MobileNetV2 + Custom Dense Head",
        "input_shape": [224, 224, 3],
        "test_metrics": {
            "loss": float(test_loss),
            "accuracy": float(test_acc),
            "weighted_precision": float(precision),
            "weighted_recall": float(recall),
            "weighted_f1_score": float(f1)
        },
        "per_class_metrics": report_dict,
        "confusion_matrix": cm.tolist(),
        "model_weights_path": keras_model_path,
        "class_names_path": class_names_path,
        "confusion_matrix_plot_path": cm_plot_path
    }

    eval_json_path = os.path.join(cm_dir, "groundnut_evaluation_results.json")
    with open(eval_json_path, "w", encoding="utf-8") as f:
        json.dump(eval_results, f, indent=2)

    # Save Markdown Evaluation Report
    eval_md_path = os.path.join(cm_dir, "groundnut_training_evaluation_report.md")
    with open(eval_md_path, "w", encoding="utf-8") as f:
        f.write("# Groundnut Disease Classifier - Training & Evaluation Report\n\n")
        f.write(f"- **Architecture:** MobileNetV2 Transfer Learning\n")
        f.write(f"- **Total Dataset Size:** {total_samples} raw leaf images\n")
        f.write(f"- **Split Counts:** Train: {len(train_files)} (70%), Val: {len(val_files)} (15%), Test: {len(test_files)} (15%)\n")
        f.write(f"- **Overall Test Accuracy:** {test_acc*100:.2f}%\n")
        f.write(f"- **Weighted Precision:** {precision*100:.2f}%\n")
        f.write(f"- **Weighted Recall:** {recall*100:.2f}%\n")
        f.write(f"- **Weighted F1 Score:** {f1*100:.2f}%\n\n")
        f.write("## Per-Class Evaluation Metrics on Untouched Test Set\n\n")
        f.write("| Class Name | Precision | Recall | F1-Score | Support |\n")
        f.write("| :--- | :--- | :--- | :--- | :--- |\n")
        for c in classes:
            c_m = report_dict[c]
            f.write(f"| `{c}` | {c_m['precision']*100:.1f}% | {c_m['recall']*100:.1f}% | {c_m['f1-score']*100:.1f}% | {c_m['support']} |\n")
        f.write("\n## Model Artifact Locations\n\n")
        f.write(f"- **Keras Model Weights:** `{keras_model_path}`\n")
        f.write(f"- **Class Names Mapping:** `{class_names_path}`\n")
        f.write(f"- **Confusion Matrix Plot:** `{cm_plot_path}`\n")

    print(f"Evaluation report saved to: {eval_md_path}")
    return eval_results

if __name__ == "__main__":
    train_groundnut_classifier()
