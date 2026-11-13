"""Train the waste classifier with MobileNetV2 transfer learning."""

from __future__ import annotations

import argparse
import math
import random
from pathlib import Path

import cv2
import numpy as np
import tensorflow as tf
import tf2onnx
from tensorflow.keras import layers
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input


CLASS_NAMES = [
    "E_Waste_Batteries",
    "Glass",
    "Metal",
    "Organic_Wet",
    "Paper_Cardboard",
    "Plastic",
    "Textiles_Footwear",
]
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
IMAGE_SIZE = (224, 224)
RANDOM_SEED = 42


class Cv2ImageSequence(tf.keras.utils.Sequence):
    def __init__(
        self,
        samples: list[tuple[Path, int]],
        batch_size: int,
        augment: bool = False,
    ) -> None:
        self.samples = samples
        self.batch_size = batch_size
        self.augment = augment
        self.augmentation = tf.keras.Sequential(
            [
                layers.RandomFlip("horizontal"),
                layers.RandomRotation(0.05),
                layers.RandomBrightness(0.2),
                layers.RandomContrast(0.2),
                layers.RandomZoom(0.25),
            ]
        )

    def __len__(self) -> int:
        return math.ceil(len(self.samples) / self.batch_size)

    def __getitem__(self, index: int) -> tuple[np.ndarray, np.ndarray]:
        batch = self.samples[index * self.batch_size : (index + 1) * self.batch_size]
        images: list[np.ndarray] = []
        labels: list[int] = []

        for image_path, label in batch:
            image = cv2.imread(str(image_path), cv2.IMREAD_COLOR)
            if image is None:
                raise ValueError(f"Unable to decode image: {image_path}")
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            image = cv2.resize(image, IMAGE_SIZE, interpolation=cv2.INTER_AREA)
            images.append(image.astype(np.float32))
            labels.append(label)

        batch_images = preprocess_input(np.stack(images))
        if self.augment:
            batch_images = self.augmentation(batch_images, training=True)
        return batch_images, tf.keras.utils.to_categorical(labels, num_classes=len(CLASS_NAMES))


def collect_samples(dataset_directory: Path) -> tuple[list[tuple[Path, int]], list[tuple[Path, int]]]:
    randomizer = random.Random(RANDOM_SEED)
    training: list[tuple[Path, int]] = []
    validation: list[tuple[Path, int]] = []

    for label, class_name in enumerate(CLASS_NAMES):
        class_directory = dataset_directory / class_name
        if not class_directory.is_dir():
            raise FileNotFoundError(f"Missing dataset class directory: {class_directory}")
        files = sorted(
            path
            for path in class_directory.iterdir()
            if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
        )
        if len(files) < 2:
            raise ValueError(f"Class {class_name} needs at least two images, found {len(files)}")
        randomizer.shuffle(files)
        split_index = max(1, int(len(files) * 0.8))
        training.extend((path, label) for path in files[:split_index])
        validation.extend((path, label) for path in files[split_index:])

    randomizer.shuffle(training)
    randomizer.shuffle(validation)
    return training, validation


def calculate_class_weights(dataset_directory: Path) -> dict[int, float]:
    class_counts = {}
    for label, class_name in enumerate(CLASS_NAMES):
        class_directory = dataset_directory / class_name
        count = sum(
            1
            for path in class_directory.iterdir()
            if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
        )
        if count == 0:
            raise ValueError(f"Class {class_name} has no training images.")
        class_counts[label] = count

    total_images = sum(class_counts.values())
    return {
        label: total_images / (len(CLASS_NAMES) * count)
        for label, count in class_counts.items()
    }


def build_model() -> tf.keras.Model:
    base_model = MobileNetV2(
        input_shape=(*IMAGE_SIZE, 3),
        include_top=False,
        weights="imagenet",
    )
    base_model.trainable = True

    inputs = tf.keras.Input(shape=(*IMAGE_SIZE, 3))
    features = base_model(inputs, training=True)
    features = layers.GlobalAveragePooling2D()(features)
    features = layers.Dropout(0.3)(features)
    outputs = layers.Dense(len(CLASS_NAMES), activation="softmax")(features)
    model = tf.keras.Model(inputs, outputs)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def parse_args() -> argparse.Namespace:
    project_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dataset", type=Path, default=project_root / "ML" / "dataset")
    parser.add_argument("--output", type=Path, default=project_root / "ML" / "waste_model.h5")
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--batch-size", type=int, default=32)
    return parser.parse_args()


def train(dataset: Path, output: Path, epochs: int, batch_size: int) -> None:
    tf.random.set_seed(RANDOM_SEED)
    training_samples, validation_samples = collect_samples(dataset)
    class_weights = calculate_class_weights(dataset)
    training = Cv2ImageSequence(training_samples, batch_size, augment=True)
    validation = Cv2ImageSequence(validation_samples, batch_size)
    model = build_model()
    model.fit(
        training,
        validation_data=validation,
        epochs=epochs,
        class_weight=class_weights,
    )
    output.parent.mkdir(parents=True, exist_ok=True)
    model.save(output)
    print(f"Saved model to {output}")

    onnx_output = output.with_suffix(".onnx")
    input_signature = (
        tf.TensorSpec((None, *IMAGE_SIZE, 3), tf.float32, name="input"),
    )
    tf2onnx.convert.from_keras(
        model,
        input_signature=input_signature,
        opset=13,
        output_path=str(onnx_output),
    )
    print(f"Saved ONNX model to {onnx_output}")


if __name__ == "__main__":
    arguments = parse_args()
    train(arguments.dataset, arguments.output, arguments.epochs, arguments.batch_size)
