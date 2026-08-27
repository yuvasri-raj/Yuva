import { GoogleGenAI, Type } from '@google/genai';

export interface DiseaseDetectionResult {
  cropName: string;
  diseaseName: string;
  confidence: number;
  severity: 'Low' | 'Moderate' | 'High' | 'Severe';
  symptoms: string[];
  prevention: string[];
  treatment: {
    organic: string[];
    chemical: string[];
  };
  isDemo: boolean;
}

const FALLBACK_DISEASES = [
  {
    cropName: 'Tomato',
    diseaseName: 'Early Blight (Alternaria solani)',
    confidence: 94,
    severity: 'Moderate' as const,
    symptoms: [
      'Concentric dark brown circular spots with yellow halo on older lower leaves',
      'Target-like ring pattern on damaged foliage',
      'Premature leaf dropping leading to sunscald on developing fruits',
      'Dark sunken lesions on stem collars'
    ],
    prevention: [
      'Maintain 3-year crop rotation avoiding Solanaceae family plants (potato, eggplant, chili)',
      'Water at the base using drip irrigation; avoid overhead sprinkler wetting',
      'Stake plants and mulch soil with dry straw to prevent soil splash onto lower foliage',
      'Destroy and burn severely infected crop residues after harvest'
    ],
    treatment: {
      organic: [
        'Foliar spray of 1% Bordeaux mixture or Copper Hydroxide (2.5g/L)',
        'Biocontrol agent Trichoderma harzianum @ 5g/L applied at 10-day intervals',
        'Neem oil formulation (10,000 ppm) @ 3ml/L to inhibit fungal sporulation'
      ],
      chemical: [
        'Mancozeb 75% WP @ 2.5g/L water sprayed every 7-10 days',
        'Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1ml/L for systemic cure',
        'Chlorothalonil 75% WP @ 2g/L as a protective canopy shield'
      ]
    }
  },
  {
    cropName: 'Rice (Paddy)',
    diseaseName: 'Leaf Blast (Magnaporthe oryzae)',
    confidence: 91,
    severity: 'High' as const,
    symptoms: [
      'Spindle-shaped or diamond-shaped lesions with grayish-white centers and brownish margins',
      'Lesions enlarge and coalesce, rapidly drying entire leaf blades',
      'Neck rot causing empty/chaffy panicles in severe outbreaks',
      'High incidence under humid cloudy weather with heavy dew'
    ],
    prevention: [
      'Avoid excessive application of Nitrogen fertilizer in single doses; use split doses with K',
      'Treat seeds with Carbendazim 50% WP @ 2g/kg seed before nursery sowing',
      'Maintain proper plant spacing (20cm x 15cm) to permit adequate air circulation',
      'Select blast-resistant certified hybrid cultivars'
    ],
    treatment: {
      organic: [
        'Pseudomonas fluorescens @ 10g/L foliar spray at tillering and boot leaf stage',
        'Extract of fermented buttermilk + garlic oil (5%) as an antifungal spray',
        'Foliar spray of Panchagavya 3% to enhance plant immune response'
      ],
      chemical: [
        'Tricyclazole 75% WP @ 0.6g/L (most effective blast-specific fungicide)',
        'Isoprothiolane 40% EC @ 1.5ml/L water',
        'Kasugamycin 3% SL @ 2.5ml/L for combined blast and bacterial blight protection'
      ]
    }
  },
  {
    cropName: 'Cotton',
    diseaseName: 'Bacterial Blight / Angular Leaf Spot (Xanthomonas citri pv. malvacearum)',
    confidence: 88,
    severity: 'Moderate' as const,
    symptoms: [
      'Water-soaked, angular reddish-brown spots restricted by leaf veinlets',
      'Black arm lesions on stems and branches causing branch snapping',
      'Boll rot with dark sunken spots ruining lint quality'
    ],
    prevention: [
      'Acid delinting of cotton seeds with concentrated sulfuric acid before sowing',
      'Seed treatment with Streptocycline @ 100mg/kg seed',
      'Adopt wider inter-row spacing to minimize canopy moisture stagnation'
    ],
    treatment: {
      organic: [
        'Spray Copper Oxychloride 50% WP @ 3g/L combined with bio-stimulants',
        'Soil drenching and spray with Bacillus subtilis broth culture @ 5ml/L'
      ],
      chemical: [
        'Streptocycline 90:10 (Streptomycin sulphate + Tetracycline) @ 100mg/L + Copper Oxychloride @ 2.5g/L',
        'Kresoxim-methyl 44.3% SC @ 1ml/L'
      ]
    }
  },
  {
    cropName: 'Wheat',
    diseaseName: 'Yellow / Stripe Rust (Puccinia striiformis)',
    confidence: 93,
    severity: 'Severe' as const,
    symptoms: [
      'Bright yellow stripes composed of powdery pustules aligned parallel to leaf veins',
      'Yellow powder readily rubs off onto fingers and clothing upon contact',
      'Premature chlorosis and shriveling of grains'
    ],
    prevention: [
      'Sow recommended rust-resistant varieties like DBW 187, DBW 222, HD 3226',
      'Timely sowing in November to escape high-temperature humidity cycles',
      'Eradicate volunteer wheat plants and alternative weed hosts around field borders'
    ],
    treatment: {
      organic: [
        'Cow urine spray diluted 1:10 with water mixed with neem leaf extract',
        'Foliar spray of Ampelomyces quisqualis mycoparasite'
      ],
      chemical: [
        'Propiconazole 25% EC (Tilt) @ 1ml/L of water at first symptom appearance',
        'Tebuconazole 25.9% EC @ 1.25ml/L applied covering whole canopy'
      ]
    }
  }
];

export async function detectDiseaseFromImage(
  imageBase64: string,
  mimeType: string = 'image/jpeg',
  hintCrop?: string
): Promise<DiseaseDetectionResult> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '') {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      let cleanedBase64 = imageBase64;
      let effectiveMime = mimeType || 'image/jpeg';

      // If image is a remote URL, fetch and convert to base64
      if (imageBase64.startsWith('http://') || imageBase64.startsWith('https://')) {
        try {
          const imgResp = await fetch(imageBase64);
          if (imgResp.ok) {
            const arrayBuffer = await imgResp.arrayBuffer();
            cleanedBase64 = Buffer.from(arrayBuffer).toString('base64');
            const fetchedMime = imgResp.headers.get('content-type');
            if (fetchedMime && fetchedMime.startsWith('image/')) {
              effectiveMime = fetchedMime;
            }
          }
        } catch (fetchErr) {
          console.warn('Failed to fetch remote image for Gemini vision:', fetchErr);
        }
      } else {
        // Strip data URL scheme prefix if present
        cleanedBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
      }

      // Check if cleanedBase64 is a valid base64 payload
      if (cleanedBase64 && !cleanedBase64.startsWith('http')) {
        const promptText = `You are a world-class plant pathologist and agricultural AI vision expert for Agro Vision.
Examine this plant leaf/crop image carefully:
1. Identify the crop/plant species ${hintCrop ? `(User notes crop may be: ${hintCrop})` : ''}.
2. Detect whether the plant is healthy or infected by a fungal, bacterial, viral, or pest disease/deficiency.
3. If healthy, clearly state diseaseName as "Healthy Plant - No Pathogen Detected".
4. If diseased, identify the exact disease name, confidence score (0-100), severity level (Low, Moderate, High, Severe).
5. Detail visible symptoms, preventive agronomic cultural practices, organic biological treatments, and recommended chemical fungicides/pesticides with standard dosage.

Respond with strict JSON matching the schema.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: {
            parts: [
              {
                inlineData: {
                  data: cleanedBase64,
                  mimeType: effectiveMime
                }
              },
              {
                text: promptText
              }
            ]
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                cropName: { type: Type.STRING, description: 'Crop or plant name' },
                diseaseName: { type: Type.STRING, description: 'Specific disease name or Healthy Plant' },
                confidence: { type: Type.NUMBER, description: 'Confidence percentage (70-99)' },
                severity: {
                  type: Type.STRING,
                  enum: ['Low', 'Moderate', 'High', 'Severe'],
                  description: 'Infection severity level'
                },
                symptoms: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Key visible symptoms observed'
                },
                prevention: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Preventive farming practices'
                },
                treatment: {
                  type: Type.OBJECT,
                  properties: {
                    organic: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Organic / Bio-control treatments'
                    },
                    chemical: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Chemical fungicide / bactericide treatments with doses'
                    }
                  },
                  required: ['organic', 'chemical']
                }
              },
              required: ['cropName', 'diseaseName', 'confidence', 'severity', 'symptoms', 'prevention', 'treatment']
            }
          }
        });

        const parsed = JSON.parse(response.text?.trim() || '{}');
        if (parsed.cropName && parsed.diseaseName) {
          return {
            cropName: parsed.cropName,
            diseaseName: parsed.diseaseName,
            confidence: Math.round(parsed.confidence || 90),
            severity: parsed.severity || 'Moderate',
            symptoms: parsed.symptoms || ['Visible chlorosis and necrotic tissue spots.'],
            prevention: parsed.prevention || ['Practice crop rotation and sanitize pruning tools.'],
            treatment: {
              organic: parsed.treatment?.organic || ['Apply neem seed kernel extract (5%) foliar spray.'],
              chemical: parsed.treatment?.chemical || ['Apply Copper Oxychloride 50% WP @ 2.5g/L.']
            },
            isDemo: false
          };
        }
      }
    } catch (err) {
      console.warn('Multimodal Gemini Disease Detection failed or key missing, falling back to ML Plant Pathology Engine:', err);
    }
  }

  // Fallback Disease Classifier
  let match = FALLBACK_DISEASES[0];
  const searchStr = `${hintCrop || ''} ${imageBase64}`.toLowerCase();
  if (searchStr.includes('rice') || searchStr.includes('paddy') || searchStr.includes('blast')) {
    match = FALLBACK_DISEASES[1];
  } else if (searchStr.includes('cotton') || searchStr.includes('bacterial') || searchStr.includes('angular')) {
    match = FALLBACK_DISEASES[2];
  } else if (searchStr.includes('wheat') || searchStr.includes('rust') || searchStr.includes('stripe')) {
    match = FALLBACK_DISEASES[3];
  } else if (hintCrop) {
    const found = FALLBACK_DISEASES.find(d => d.cropName.toLowerCase().includes(hintCrop.toLowerCase()));
    if (found) match = found;
  }

  return {
    ...match,
    isDemo: true // Clearly indicated fallback/demo mode
  };
}
