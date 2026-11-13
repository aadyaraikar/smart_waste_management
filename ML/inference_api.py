from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import uvicorn
from pathlib import Path

app = FastAPI()

# Allow your React frontend and Node backend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. THE CONTRACT DICTIONARY
# Maps your exact 7 folder/class names to the metadata expected by the frontend
WASTE_CONTRACT_INFO = {
    "Plastic": {
        "recycler_type": "Dry Waste Kabadiwala / Plastic Recycler",
        "disposal_instruction": "Empty liquids, rinse lightly, and crush before pickup."
    },
    "Paper_Cardboard": {
        "recycler_type": "Dry Waste Kabadiwala",
        "disposal_instruction": "Keep dry, remove plastic tape, and flatten boxes."
    },
    "Metal": {
        "recycler_type": "Scrap Metal Dealer",
        "disposal_instruction": "Separate from wet waste; high scrap resale value."
    },
    "Glass": {
        "recycler_type": "Glass Recycler",
        "disposal_instruction": "Wrap broken glass in newspaper; keep metal caps separate."
    },
    "E_Waste_Batteries": {
        "recycler_type": "Authorised E-Waste Processor / Repair Shop",
        "disposal_instruction": "Do not throw in regular bins; schedule an e-waste pickup."
    },
    "Textiles_Footwear": {
        "recycler_type": "NGO / Thrift & Repair Collective",
        "disposal_instruction": "Bag clean wearable items for donation, or route worn items for upcycling."
    },
    "Organic_Wet": {
        "recycler_type": "Municipal Wet Bin / Local Composter",
        "disposal_instruction": "No pickup needed—dispose directly in the green wet-waste bin."
    }
}

CLASS_NAMES = [
    "E_Waste_Batteries",
    "Glass",
    "Metal",
    "Organic_Wet",
    "Paper_Cardboard",
    "Plastic",
    "Textiles_Footwear",
]

MODEL_PATH = Path(__file__).with_name("waste_model.onnx")
if not MODEL_PATH.exists():
    raise RuntimeError(f"ONNX model not found at {MODEL_PATH}. Export waste_model.onnx before starting the API.")
model = cv2.dnn.readNetFromONNX(str(MODEL_PATH))

@app.post("/classify")
async def classify_waste(file: UploadFile = File(...)):
    # 2. READ & PREPROCESS IMAGE WITH OPENCV
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid image")
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (224, 224), interpolation=cv2.INTER_AREA)
    model_input = cv2.dnn.blobFromImage(
        img,
        scalefactor=1.0 / 255.0,
        size=(224, 224),
        mean=(0, 0, 0),
        swapRB=False,
        crop=False,
    )
    model.setInput(model_input)
    preds = model.forward()[0].astype(np.float32)
    print(f"[ML] Raw preds from net.forward()[0]: {preds.tolist()}", flush=True)
    if preds.size != len(CLASS_NAMES):
        raise RuntimeError(
            f"ONNX model returned {preds.size} scores; expected {len(CLASS_NAMES)}."
        )
    predictions = preds.copy()
    if np.any(predictions < 0) or not np.isclose(float(predictions.sum()), 1.0, atol=1e-3):
        predictions = np.exp(predictions - np.max(predictions))
        predictions /= predictions.sum()
    print("[ML] Class probabilities:", flush=True)
    for class_name, probability in zip(CLASS_NAMES, predictions):
        print(f"  {class_name}: {float(probability):.6f}", flush=True)
    predicted_idx = int(np.argmax(predictions))
    predicted_label = CLASS_NAMES[predicted_idx]
    confidence = float(predictions[predicted_idx])
    uncertain = confidence < 0.60

    # 4. FORMAT & RETURN THE EXACT JSON CONTRACT
    contract_details = WASTE_CONTRACT_INFO[predicted_label]
    
    return {
        "category": predicted_label,
        "confidence": round(confidence, 2),
        "uncertain": uncertain,
        "recycler_type": contract_details["recycler_type"],
        "disposal_instruction": contract_details["disposal_instruction"]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)