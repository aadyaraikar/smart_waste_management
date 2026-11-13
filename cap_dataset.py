import os
import random
import shutil

# Path to your extracted dataset directory containing the 7 subfolders
DATASET_DIR = "./dataset"
MAX_IMAGES_PER_CLASS = 1000  # Cap limit

# Set a seed so your file selection is reproducible
random.seed(42)

for category in os.listdir(DATASET_DIR):
    category_path = os.path.join(DATASET_DIR, category)
    
    if not os.path.isdir(category_path):
        continue
        
    images = os.listdir(category_path)
    # Filter for standard image formats
    images = [img for img in images if img.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
    
    print(f"[{category}] Found {len(images)} images.")
    
    if len(images) > MAX_IMAGES_PER_CLASS:
        print(f"  -> Capping to {MAX_IMAGES_PER_CLASS} images...")
        # Randomly select images to keep
        images_to_keep = set(random.sample(images, MAX_IMAGES_PER_CLASS))
        
        # Delete the excess images
        deleted_count = 0
        for img in images:
            if img not in images_to_keep:
                os.remove(os.path.join(category_path, img))
                deleted_count += 1
        print(f"  -> Removed {deleted_count} excess images.")
    else:
        print("  -> Under limit, keeping all.")

print("Dataset capping complete")