"""Build the capped, seven-class dataset used by the waste classifier."""

from __future__ import annotations

import argparse
import random
import shutil
from pathlib import Path


CLASS_SOURCES = {
    "Textiles_Footwear": ("clothes", "shoes"),
    "Paper_Cardboard": ("paper", "cardboard"),
    "E_Waste_Batteries": ("battery",),
    "Organic_Wet": ("biological",),
    "Plastic": ("plastic",),
    "Metal": ("metal",),
    "Glass": ("glass",),
}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
MAX_IMAGES_PER_CLASS = 1_000
RANDOM_SEED = 42


def parse_args() -> argparse.Namespace:
    project_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source",
        type=Path,
        default=project_root / "archive" / "original",
        help="Archive variant containing the source category folders.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=project_root / "ML" / "dataset",
        help="Directory to create with the seven target folders.",
    )
    return parser.parse_args()


def image_files(directory: Path) -> list[Path]:
    return sorted(
        path for path in directory.iterdir() if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
    )


def prepare_dataset(source: Path, output: Path) -> None:
    if not source.is_dir():
        raise FileNotFoundError(f"Source archive directory does not exist: {source}")

    output.mkdir(parents=True, exist_ok=True)
    randomizer = random.Random(RANDOM_SEED)

    for target_class, source_classes in CLASS_SOURCES.items():
        target_directory = output / target_class
        if target_directory.exists():
            shutil.rmtree(target_directory)
        target_directory.mkdir(parents=True)

        candidates = [
            image
            for source_class in source_classes
            for image in image_files(source / source_class)
        ]
        randomizer.shuffle(candidates)
        selected = candidates[:MAX_IMAGES_PER_CLASS]

        for index, image in enumerate(selected, start=1):
            destination = target_directory / f"{index:04d}_{image.name}"
            shutil.copy2(image, destination)

        print(f"{target_class}: copied {len(selected)} of {len(candidates)} images")


if __name__ == "__main__":
    arguments = parse_args()
    prepare_dataset(arguments.source, arguments.output)
