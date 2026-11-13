const axios = require("axios");
const cors = require("cors");
const express = require("express");
const FormData = require("form-data");
const multer = require("multer");

const app = express();
const port = process.env.PORT || 3000;
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

const recyclers = [
  {
    id: 1,
    name: "GreenLoop Plastics",
    category: "Plastic",
    address: "12 MG Road, Bengaluru",
    lat: 12.9756,
    lng: 77.605,
    phone: "+91-80-4000-1001",
    verified: true,
  },
  {
    id: 2,
    name: "RePlast Community Center",
    category: "Plastic",
    address: "48 FC Road, Pune",
    lat: 18.5204,
    lng: 73.841,
    phone: "+91-20-4000-1002",
    verified: true,
  },
  {
    id: 3,
    name: "OceanSafe Recycling",
    category: "Plastic",
    address: "7 Beach Road, Chennai",
    lat: 13.0501,
    lng: 80.2824,
    phone: "+91-44-4000-1003",
    verified: false,
  },
  {
    id: 4,
    name: "PaperCycle NGO",
    category: "Paper_Cardboard",
    address: "23 Park Street, Kolkata",
    lat: 22.5535,
    lng: 88.3516,
    phone: "+91-33-4000-1004",
    verified: true,
  },
  {
    id: 5,
    name: "SecondSheet Recyclers",
    category: "Paper_Cardboard",
    address: "91 Civil Lines, Jaipur",
    lat: 26.9157,
    lng: 75.8011,
    phone: "+91-141-4000-1005",
    verified: false,
  },
  {
    id: 6,
    name: "MetalMitra Foundation",
    category: "Metal",
    address: "5 MIDC Road, Nagpur",
    lat: 21.1232,
    lng: 79.0535,
    phone: "+91-712-4000-1006",
    verified: true,
  },
  {
    id: 7,
    name: "Urban Scrap Collective",
    category: "Metal",
    address: "38 Industrial Area, Indore",
    lat: 22.7196,
    lng: 75.8577,
    phone: "+91-731-4000-1007",
    verified: true,
  },
  {
    id: 8,
    name: "ClearGlass Recycling",
    category: "Glass",
    address: "16 Ring Road, Ahmedabad",
    lat: 23.0225,
    lng: 72.5714,
    phone: "+91-79-4000-1008",
    verified: true,
  },
  {
    id: 9,
    name: "BottleBack NGO",
    category: "Glass",
    address: "62 Residency Road, Hyderabad",
    lat: 17.4126,
    lng: 78.4482,
    phone: "+91-40-4000-1009",
    verified: false,
  },
  {
    id: 10,
    name: "BatteryWise E-Waste Center",
    category: "E_Waste_Batteries",
    address: "29 HSR Layout, Bengaluru",
    lat: 12.9116,
    lng: 77.6389,
    phone: "+91-80-4000-1010",
    verified: true,
  },
  {
    id: 11,
    name: "Reboot Electronics NGO",
    category: "E_Waste_Batteries",
    address: "14 Andheri East, Mumbai",
    lat: 19.1155,
    lng: 72.8727,
    phone: "+91-22-4000-1011",
    verified: false,
  },
  {
    id: 12,
    name: "WearAgain Collective",
    category: "Textiles_Footwear",
    address: "31 Anna Nagar, Chennai",
    lat: 13.085,
    lng: 80.2101,
    phone: "+91-44-4000-1012",
    verified: true,
  },
  {
    id: 13,
    name: "ThreadCycle Foundation",
    category: "Textiles_Footwear",
    address: "8 Banjara Hills, Hyderabad",
    lat: 17.4156,
    lng: 78.4347,
    phone: "+91-40-4000-1013",
    verified: true,
  },
  {
    id: 14,
    name: "SoleMates Reuse NGO",
    category: "Textiles_Footwear",
    address: "54 Connaught Place, New Delhi",
    lat: 28.6315,
    lng: 77.2167,
    phone: "+91-11-4000-1014",
    verified: false,
  },
  {
    id: 15,
    name: "SoilCircle Organics",
    category: "Oragnic_Wet",
    address: "11 Baner Road, Pune",
    lat: 18.559,
    lng: 73.7868,
    phone: "+91-20-4000-1015",
    verified: true,
  },
];

const pickupRequests = [];

const fallbackClassification = {
  category: "Plastic",
  confidence: 0.9,
  recycler_type: "Dry Waste Kabadiwala / Plastic Recycler",
  disposal_instruction: "Empty liquids, rinse lightly, and crush before pickup.",
};

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/recyclers", (_req, res) => {
  res.json(recyclers);
});

app.get("/recyclers", (req, res) => {
  const category =
    typeof req.query.category === "string"
      ? req.query.category.trim().toLowerCase()
      : "";
  const matches = category
    ? recyclers.filter((recycler) => recycler.category.toLowerCase() === category)
    : [];

  res.json(matches.length > 0 ? matches : recyclers);
});

app.post("/pickups", (req, res) => {
  const { category, recycler_id, user_address, notes } = req.body;
  const pickupRequest = {
    id: pickupRequests.length + 1,
    category,
    recycler_id,
    user_address,
    notes,
    timestamp: new Date().toISOString(),
    status: "Requested",
  };

  pickupRequests.push(pickupRequest);
  res.status(201).json(pickupRequest);
});

app.get("/pickups", (_req, res) => {
  res.json(pickupRequests);
});

app.patch("/pickups/:id", (req, res) => {
  const pickupRequest = pickupRequests.find(
    (pickup) => pickup.id === Number(req.params.id),
  );
  if (!pickupRequest) {
    return res.status(404).json({ error: "Pickup request not found." });
  }

  const status = req.body && req.body.status;
  if (typeof status !== "string" || status.trim().length === 0) {
    return res.status(400).json({ error: "A non-empty status is required." });
  }

  pickupRequest.status = status.trim();
  return res.json(pickupRequest);
});

app.post(
  "/classify-and-match",
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'An image file is required in "file".' });
    }

    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    let classification;
    try {
      const response = await axios.post(
        "http://localhost:8000/classify",
        form,
        { headers: form.getHeaders(), timeout: 30000 },
      );
      classification = response.data;
    } catch (error) {
      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }

      if (!error.request) {
        return res.status(500).json({ error: "Failed to send image to the ML API." });
      }

      classification = fallbackClassification;
    }

    const category = classification.category.toLowerCase();
    const recyclerCategory = category === "organic_wet" ? "oragnic_wet" : category;
    const matchingRecyclers = recyclers.filter(
      (recycler) => recycler.category.toLowerCase() === recyclerCategory,
    );

    res.json({ classification, recyclers: matchingRecyclers });
  },
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running live on port ${PORT}`);
});