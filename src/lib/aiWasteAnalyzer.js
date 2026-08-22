/**
 * swaach.x AI Smart Waste Analyzer & LLM Suggestions Engine
 * Powered by Google Gemini Vision 3.6 Flash API & Smart Circular Economy Knowledge Base
 */

// Google Gemini API Key from environment
export const DEFAULT_GEMINI_API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
  '';

// Common non-waste keywords (screenshots, UI captures, portraits, pets, general non-waste)
const NON_WASTE_KEYWORDS = [
  'screenshot', 'screen_shot', 'screen shot', 'capture', 'snip', 'desktop',
  'ui', 'dashboard', 'ticket', 'table', 'chart', 'diagram', 'icon', 'logo', 'button', 'window', 'app', 'website',
  'person', 'human', 'selfie', 'face', 'portrait', 'people', 'man', 'woman', 'child', 'baby', 'profile', 'avatar',
  'dog', 'cat', 'puppy', 'kitten', 'bird_alive', 'fish_alive',
  'car', 'automobile', 'vehicle_clean', 'bike', 'motorcycle', 'scooter',
  'sky', 'sunset', 'cloud', 'mountain', 'landscape', 'beach', 'tree_living', 'flower_garden',
  'living_room', 'bedroom', 'furniture', 'bed', 'sofa', 'table_clean', 'chair_clean',
  'passport', 'id_card', 'currency', 'money', 'cash', 'credit_card', 'receipt', 'invoice',
  'not_waste', 'not waste', 'non_waste', 'non waste'
];

// Circular economy knowledge base for verified municipal waste categories
const SMART_WASTE_KNOWLEDGE_BASE = [
  {
    typeKey: 'plastic',
    keywords: ['plastic', 'bottle', 'pet', 'cup', 'straw', 'poly', 'wrapper', 'bag', 'container', 'shampoo', 'packaging'],
    isWaste: true,
    wasteType: 'Single-Use & Recyclable Plastic (PET / HDPE)',
    category: 'Dry Recyclable (Plastic/Paper/Metal)',
    binColor: 'Blue (Dry Recyclable Bin)',
    binHex: '#0284c7',
    binIcon: '♻️',
    compostable: false,
    recyclable: true,
    carbonSavedKg: 1.8,
    karmaPoints: 25,
    segregationTip: 'Rinse thoroughly to remove liquid residue. Crush the bottle to save 75% volume before placing in the Blue Dry Waste Bin.',
    upcyclingIdeas: [
      '🌱 Self-Watering Planter: Cut bottle in half, invert top half with a cotton wick to grow herbs or indoor succulents.',
      '🐦 Eco Bird Feeder: Pierce two wooden spoons across the bottle to make perches with gravity seed dispensers.',
      '💡 Desk Organizer & Pen Stand: Cut bottom 4 inches, smooth edges with a warm iron, and decorate for office stationery.',
      '💧 Drip Irrigation: Poke pinholes in the cap, fill with water, and bury inverted next to plants for slow root hydration.'
    ],
    environmentalImpact: 'Recycling 1 ton of plastic saves 5,774 kWh of energy, 16.3 barrels of oil, and prevents marine microplastic pollution.'
  },
  {
    typeKey: 'organic',
    keywords: ['organic', 'food', 'banana', 'peel', 'apple', 'vegetable', 'fruit', 'waste', 'kitchen', 'scrap', 'leaf', 'plant', 'egg', 'tea', 'coffee', 'wet'],
    isWaste: true,
    wasteType: 'Organic Wet Waste & Kitchen Biomass',
    category: 'Organic / Wet Waste',
    binColor: 'Green (Wet / Organic Waste Bin)',
    binHex: '#16a34a',
    binIcon: '🌿',
    compostable: true,
    recyclable: false,
    carbonSavedKg: 2.4,
    karmaPoints: 30,
    segregationTip: 'Do not mix with plastic wrappers or staples. Collect in an aerated container and deposit in the Green Wet Waste Bin or home composter.',
    upcyclingIdeas: [
      '🍂 Home Aerobic Composting: Mix with dry leaves/shredded cardboard (3:1 ratio) to create nutrient-rich black gold for gardens in 30 days.',
      '☕ Coffee & Tea Fertilizer: Mix spent coffee grounds and tea leaves directly into garden soil to boost nitrogen for roses and tomatoes.',
      '🍋 Citrus Natural Cleaner: Soak orange/lemon peels in white vinegar for 2 weeks to create an all-natural grease-cutting disinfectant spray.',
      '🌱 Bio-Enzyme Kitchen Cleaner: Ferment 1 part jaggery, 3 parts fruit peels, and 10 parts water for 90 days to yield organic floor cleaner.'
    ],
    environmentalImpact: 'Diverting organic waste from landfills eliminates harmful methane gas generation (methane is 28x more potent than CO2).'
  },
  {
    typeKey: 'ewaste',
    keywords: ['battery', 'e-waste', 'ewaste', 'cable', 'wire', 'charger', 'circuit', 'gadget', 'electronic', 'device'],
    isWaste: true,
    wasteType: 'Electronic Waste & Lithium-Ion / Alkaline Batteries',
    category: 'Electronic & Battery E-Waste',
    binColor: 'Red (Hazardous / E-Waste Bin)',
    binHex: '#dc2626',
    binIcon: '⚡',
    compostable: false,
    recyclable: true,
    carbonSavedKg: 5.2,
    karmaPoints: 40,
    segregationTip: 'Tape exposed battery terminals with masking tape to prevent fire hazards. Never dispose in regular bins; drop off at AMC authorized E-waste collection centers.',
    upcyclingIdeas: [
      '🔌 Cable Preservation & Organization: Protect frayed wires using heat-shrink tubing or spring wraps to extend gadget lifespan.',
      '♻️ Certified E-Waste Exchange: Hand over to AMC municipal drop-off hubs to recover precious rare-earth metals (Gold, Silver, Copper).',
      '📱 DIY Digital Clock / Smart Home Display: Repurpose obsolete smartphones as dedicated bedside clocks, IP security cameras, or weather monitors.',
      '🔩 Maker Scrap Craft: Disassemble broken toys or electronics for DC motors, LEDs, and gears in school STEM science projects.'
    ],
    environmentalImpact: 'Recycling 1 million cell phones recovers 35,000 lbs of copper, 772 lbs of silver, 75 lbs of gold, and 33 lbs of palladium.'
  },
  {
    typeKey: 'cardboard',
    keywords: ['cardboard', 'carton', 'box', 'newspaper', 'paper', 'magazine', 'packaging_box', 'shipping'],
    isWaste: true,
    wasteType: 'Corrugated Cardboard & Mixed Paper Pulp',
    category: 'Dry Recyclable (Plastic/Paper/Metal)',
    binColor: 'Blue (Dry Recyclable Bin)',
    binHex: '#0284c7',
    binIcon: '📦',
    compostable: true,
    recyclable: true,
    carbonSavedKg: 1.5,
    karmaPoints: 20,
    segregationTip: 'Flatten boxes completely to minimize storage volume. Keep dry — wet or grease-stained paper (like greasy pizza boxes) cannot be recycled with clean paper.',
    upcyclingIdeas: [
      '📦 Drawer Dividers: Cut cardboard sheets into interlocking strips to organize clothing, cables, or kitchen utensils.',
      '🌱 Seed Starter Pots: Fold newspaper or egg cartons into biodegradable cups to germinate seeds, then plant directly into soil.',
      '🎨 Biodegradable Mulch / Weed Barrier: Lay non-printed brown cardboard beneath soil mulch to suppress garden weeds and retain moisture.',
      '🐈 Pet Scratching Pad: Tightly roll and glue cardboard strips into a spiral disc to create a durable, scratch-resistant cat scratching pad.'
    ],
    environmentalImpact: 'Recycling 1 ton of cardboard saves 17 mature trees, 7,000 gallons of water, and 4,100 kWh of electricity.'
  },
  {
    typeKey: 'metal',
    keywords: ['can', 'aluminum', 'soda', 'tin', 'metal', 'foil', 'steel', 'iron', 'beverage'],
    isWaste: true,
    wasteType: 'Aluminum Cans & Metal Scrap',
    category: 'Dry Recyclable (Plastic/Paper/Metal)',
    binColor: 'Blue (Dry Recyclable Bin)',
    binHex: '#0284c7',
    binIcon: '🥫',
    compostable: false,
    recyclable: true,
    carbonSavedKg: 3.6,
    karmaPoints: 30,
    segregationTip: 'Rinse out food remains and crush aluminum beverage cans. Aluminum can be recycled infinitely without quality degradation.',
    upcyclingIdeas: [
      '🕯️ Lantern Candle Holders: Punch decorative geometric hole patterns into clean tin cans for outdoor ambient tea-light lanterns.',
      '🌿 Herb Garden Planters: Drill drainage holes in the base of tin cans, coat with waterproof paint, and grow mint or basil on kitchen windowsills.',
      '✏️ Desktop Pencil Caddies: Paint and wrap aluminum cans with jute twine or fabric for rustic desk utensil organizers.',
      '🏷️ Reusable Plant Markers: Cut aluminum drink cans into flat strips and emboss plant names with a ballpoint pen for weatherproof tags.'
    ],
    environmentalImpact: 'Recycling aluminum consumes 95% less energy than extracting primary aluminum from bauxite ore.'
  },
  {
    typeKey: 'glass',
    keywords: ['glass', 'jar', 'glass_bottle', 'ceramic', 'pickle_jar', 'condiment'],
    isWaste: true,
    wasteType: 'Silica Glass Containers & Jars',
    category: 'Glass & Ceramics',
    binColor: 'Blue (Dry Recyclable Bin)',
    binHex: '#0284c7',
    binIcon: '🏺',
    compostable: false,
    recyclable: true,
    carbonSavedKg: 2.1,
    karmaPoints: 25,
    segregationTip: 'Remove metal/plastic caps. Rinse jar clean. Separate broken glass in a labeled puncture-proof container to prevent sanitation worker injuries.',
    upcyclingIdeas: [
      '🫙 Kitchen Pantry Storage: Clean pickle/jam jars make airtight, toxic-free containers for pulses, spices, lentils, and dry fruits.',
      '🌿 Terrarium Ecosystem: Layer small pebbles, activated charcoal, and moss in a glass jar to build a self-sustaining closed terrarium.',
      '🕯️ Scented Soy Candles: Pour melted soy wax and essential oils with a cotton wick directly into empty jars for handmade scented candles.',
      '🌸 Hydroponic Cutting Station: Fill jars with fresh water to propagate money plant or philodendron stem cuttings on windowsills.'
    ],
    environmentalImpact: 'Glass is 100% recyclable indefinitely with zero loss in chemical purity or physical clarity.'
  },
  {
    typeKey: 'textile',
    keywords: ['fabric', 'cloth', 'shirt', 'clothes', 'denim', 'cotton', 'textile', 'rag', 'apparel'],
    isWaste: true,
    wasteType: 'Textile Waste & Old Apparel Fabrics',
    category: 'Dry Recyclable (Plastic/Paper/Metal)',
    binColor: 'Blue (Dry Recyclable Bin)',
    binHex: '#0284c7',
    binIcon: '👕',
    compostable: false,
    recyclable: true,
    carbonSavedKg: 4.0,
    karmaPoints: 35,
    segregationTip: 'If in usable condition, donate to local municipal charity drives. For non-wearable textiles, cut into reusable cleaning rags.',
    upcyclingIdeas: [
      '🛍️ Reusable Tote Bags: Sew old cotton t-shirts or denim jeans into durable zero-waste grocery shopping bags.',
      '🧽 Zero-Waste Cleaning Rags: Cut soft cotton clothes into kitchen dusters and dish-drying wipes, replacing synthetic paper towels.',
      '🧶 Braided Door Mat: Tear scrap fabrics into long strips, braid together, and coil into a colorful, washable entrance mat.',
      '🧵 Scented Wardrobe Sachets: Fill small cloth pouches with dried lavender or camphor to keep closets fresh and moth-free.'
    ],
    environmentalImpact: 'The textile industry generates 10% of global greenhouse emissions; reusing 1 kg of cotton saves over 20,000 liters of water.'
  }
];

/**
 * Convert a File, Blob, or URL into a Base64 string for Gemini Vision payload
 */
export const fileToBase64 = async (fileOrUrl) => {
  if (typeof fileOrUrl === 'string') {
    if (fileOrUrl.startsWith('data:')) {
      const parts = fileOrUrl.split(',');
      const mime = parts[0].split(';')[0].replace('data:', '');
      return {
        base64: parts[1],
        dataUrl: fileOrUrl,
        mimeType: mime,
      };
    }
    // Remote URL (e.g. Unsplash sample)
    const res = await fetch(fileOrUrl);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve({
          base64: base64String,
          dataUrl: reader.result,
          mimeType: blob.type || 'image/jpeg',
        });
      };
      reader.onerror = (err) => reject(err);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(fileOrUrl);
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      resolve({
        base64: base64String,
        dataUrl: reader.result,
        mimeType: fileOrUrl.type || 'image/jpeg',
      });
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Identify matching knowledge base item based on text or file name, with strict non-waste detection
 */
export const findKnowledgeBaseMatch = (textHint = '') => {
  const clean = textHint.toLowerCase().trim();

  // 1. Explicit non-waste cues (screenshots, software UI, selfies, portraits, pets)
  const isExplicitNonWaste = NON_WASTE_KEYWORDS.some((kw) => clean.includes(kw));
  if (isExplicitNonWaste) {
    let detectedName = 'Screenshot / UI Image / Non-Waste Item';
    if (clean.includes('screenshot') || clean.includes('screen_shot') || clean.includes('screen shot') || clean.includes('ticket') || clean.includes('table') || clean.includes('ui') || clean.includes('dashboard')) {
      detectedName = 'App Screenshot / Digital Document';
    } else if (clean.includes('person') || clean.includes('selfie') || clean.includes('human') || clean.includes('portrait')) {
      detectedName = 'Person / Portrait Selfie';
    } else if (clean.includes('dog') || clean.includes('cat') || clean.includes('pet')) {
      detectedName = 'Living Animal / Pet';
    }

    return {
      isWaste: false,
      detectedObject: detectedName,
      nonWasteReason: 'This is not a waste item. The image appears to be a digital screenshot or non-waste photo. Please upload a clear photo of garbage, discarded materials, or recyclable containers to receive municipal segregation guidance.',
    };
  }

  // 2. Check for specific verified waste categories in text/tag
  for (const item of SMART_WASTE_KNOWLEDGE_BASE) {
    if (item.keywords.some((k) => clean.includes(k))) {
      return { isWaste: true, ...item };
    }
  }

  // 3. Fallback for camera uploads or unrecognized waste photos: Classify as Dry Recyclable Waste
  return {
    isWaste: true,
    ...SMART_WASTE_KNOWLEDGE_BASE[0],
  };
};

/**
 * Analyze waste image using Google Gemini Vision API (gemini-3.6-flash)
 * @param {Object} options
 * @param {File|string} options.imageFile - File object or image Data URL
 * @param {string} [options.textHint] - Optional filename, caption, or user description
 * @param {string} [options.customApiKey] - Optional custom Gemini API key
 */
export const analyzeWasteWithGemini = async ({
  imageFile,
  textHint = '',
  customApiKey = '',
}) => {
  const apiKey =
    customApiKey ||
    DEFAULT_GEMINI_API_KEY;

  // 1. Google Gemini 3.6 Flash Vision API
  if (apiKey && imageFile) {
    try {
      const converted = await fileToBase64(imageFile);
      const base64Data = converted.base64;
      const mimeType = converted.mimeType || 'image/jpeg';

      if (base64Data) {
        const prompt = `
You are the swaach.x Municipal AI Waste Verification & Circular Economy Assistant.
Carefully analyze this uploaded image.

CRITICAL FIRST REQUIREMENT:
Determine whether the image depicts actual physical discarded waste, garbage, trash, litter, food scraps, or recyclable containers.
If the image is a screenshot of software / website / UI / tables / code, a person/selfie, a living animal/pet, a clean room, a car/vehicle, a document, currency, or any intact non-discarded object:
You MUST mark isWaste as false!
Return this JSON:
{
  "isWaste": false,
  "detectedObject": "Specific name of what is shown (e.g. Software Screenshot, User Interface, Person Portrait, Pet Animal, Clean Furniture)",
  "nonWasteReason": "This is not a waste item. The image appears to be a digital screenshot or non-waste photo. Please upload a clear photo of garbage or recyclable waste for segregation suggestions."
}

ONLY IF the image clearly depicts actual physical discarded waste, garbage, trash accumulation, or recyclable containers:
Return this JSON:
{
  "isWaste": true,
  "wasteType": "Concise specific name of the detected waste item(s)",
  "category": "One of: Organic / Wet Waste | Dry Recyclable (Plastic/Paper/Metal) | Electronic & Battery E-Waste | Hazardous Bio-Medical | Glass & Ceramics",
  "binColor": "Green (Wet Waste Bin) | Blue (Dry Recyclable Bin) | Red (Hazardous / E-Waste Bin)",
  "binHex": "#16a34a for green, #0284c7 for blue, or #dc2626 for red",
  "binIcon": "Emoji icon e.g. 🌿, ♻️, ⚡, 🏺",
  "compostable": true or false,
  "recyclable": true or false,
  "carbonSavedKg": numeric estimate of kg CO2 saved by recycling this,
  "karmaPoints": integer between 15 and 50,
  "segregationTip": "1-2 sentences on exactly how to prepare and dispose of this item in municipal guidelines",
  "upcyclingIdeas": [
    "Idea 1 with practical instructions",
    "Idea 2 with practical instructions",
    "Idea 3 with practical instructions"
  ],
  "environmentalImpact": "1-2 sentences on why proper disposal of this item matters for public health and urban ecology"
}`;

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.0,
              response_mime_type: 'application/json',
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            try {
              const cleanJson = candidateText.replace(/```json/g, '').replace(/```/g, '').trim();
              const parsed = JSON.parse(cleanJson);
              return {
                success: true,
                source: 'Google Gemini Vision AI 3.6 (Live)',
                isWaste: parsed.isWaste === true,
                ...parsed,
              };
            } catch (jsonErr) {
              console.warn('Gemini JSON parse fallback:', jsonErr);
            }
          }
        }
      }
    } catch (apiErr) {
      console.warn('Gemini API call warning, falling back to Knowledge Engine:', apiErr);
    }
  }

  // 2. Intelligent Fast Knowledge Engine fallback
  await new Promise((resolve) => setTimeout(resolve, 400));

  const fileName = (imageFile && typeof imageFile === 'object' && imageFile.name) ? imageFile.name : '';
  const searchCue = `${fileName} ${textHint}`.trim();

  const matched = findKnowledgeBaseMatch(searchCue);

  return {
    success: true,
    source: 'swaach.x Smart Waste Knowledge Engine (Built-in)',
    ...matched,
  };
};

export const PRESET_WASTE_SAMPLES = [
  {
    name: 'Plastic Water Bottles (PET)',
    category: 'Dry Recyclable',
    icon: '🧴',
    tag: 'plastic bottle pet packaging container',
    previewUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&auto=format&fit=crop&q=60',
  },
  {
    name: 'Kitchen Vegetable & Fruit Scraps',
    category: 'Organic Wet Waste',
    icon: '🥦',
    tag: 'vegetable scrap fruit peel food waste banana organic wet',
    previewUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60',
  },
  {
    name: 'Corrugated Shipping Boxes',
    category: 'Cardboard Paper',
    icon: '📦',
    tag: 'corrugated box cardboard carton packaging paper',
    previewUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&auto=format&fit=crop&q=60',
  },
  {
    name: 'Old USB Cables & Dead Batteries',
    category: 'Electronic E-Waste',
    icon: '⚡',
    tag: 'battery e-waste cable charger wire gadget electronic',
    previewUrl: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=500&auto=format&fit=crop&q=60',
  },
  {
    name: 'Aluminum Beverage Cans',
    category: 'Metal Scrap',
    icon: '🥫',
    tag: 'aluminum can soda tin metal foil beverage',
    previewUrl: 'https://images.unsplash.com/photo-1582408921715-18e7806365c1?w=500&auto=format&fit=crop&q=60',
  },
  {
    name: 'Empty Glass Condiment Jars',
    category: 'Glass / Silica',
    icon: '🏺',
    tag: 'glass jar bottle pickle condiment',
    previewUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60',
  },
  {
    name: 'UI Screenshot Test (Non-Waste)',
    category: 'Non-Waste Entity',
    icon: '💻',
    tag: 'screenshot ui dashboard table ticket not_waste',
    previewUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60',
  },
];
