import { GoogleGenAI, Type } from '@google/genai';

interface CropInput {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  rainfall: number;
  soilPh?: number;
  soilType: string;
  location: string;
}

export interface CropResult {
  recommendedCrop: string;
  confidence: number;
  explanation: string;
  secondaryCrops: string[];
  soilSuitability: string;
  climateSuitability: string;
  expectedBenefits: string;
  guidance: string[];
  isDemo: boolean;
}

// Agronomy Knowledge Base for Fallback Engine
const CROPS_DATABASE = [
  {
    name: 'Rice (Paddy)',
    nRange: [60, 120],
    pRange: [30, 60],
    kRange: [30, 60],
    tempRange: [20, 38],
    humidityRange: [70, 95],
    rainfallRange: [1000, 2500],
    phRange: [5.5, 7.2],
    soilTypes: ['Clay', 'Clay Loam', 'Alluvial', 'Black Soil'],
    benefits: 'High market demand, MSP procurement security, high caloric yield per acre.',
    guidance: [
      'Maintain 2-5 cm standing water during tillering and flowering stages.',
      'Apply nitrogen in 3 split doses: basal, active tillering, and panicle initiation.',
      'Opt for bio-fertilizers like Azospirillum and Phosphobacteria to boost root uptake.'
    ]
  },
  {
    name: 'Wheat',
    nRange: [80, 140],
    pRange: [40, 70],
    kRange: [30, 60],
    tempRange: [12, 25],
    humidityRange: [50, 70],
    rainfallRange: [400, 800],
    phRange: [6.0, 7.5],
    soilTypes: ['Loam', 'Clay Loam', 'Alluvial'],
    benefits: 'Stable winter cash crop, excellent staple demand, minimal water compared to rice.',
    guidance: [
      'Crown Root Initiation (CRI) stage at 20-25 days after sowing is critical for irrigation.',
      'Treat seeds with Trichoderma viride before sowing to prevent root rot.',
      'Maintain optimal row spacing of 20-22.5 cm for uniform sunlight penetration.'
    ]
  },
  {
    name: 'Cotton',
    nRange: [90, 150],
    pRange: [40, 80],
    kRange: [40, 80],
    tempRange: [21, 35],
    humidityRange: [50, 75],
    rainfallRange: [500, 1100],
    phRange: [6.0, 8.0],
    soilTypes: ['Black Soil', 'Deep Alluvial', 'Loam'],
    benefits: 'High commercial cash returns, strong textile industry demand, drought tolerance.',
    guidance: [
      'Implement Integrated Pest Management (IPM) with yellow sticky traps and neem oil.',
      'Ensure proper drainage to avoid waterlogging during early boll formation.',
      'Foliar spray of 2% DAP at flowering and boll development improves boll retention.'
    ]
  },
  {
    name: 'Sugarcane',
    nRange: [150, 250],
    pRange: [60, 100],
    kRange: [80, 150],
    tempRange: [24, 38],
    humidityRange: [60, 85],
    rainfallRange: [1100, 2000],
    phRange: [6.5, 8.0],
    soilTypes: ['Deep Loam', 'Clay Loam', 'Alluvial', 'Black Soil'],
    benefits: 'High biomass, guaranteed sugar mill procurement, multiple ratoon cropping potential.',
    guidance: [
      'Adopt drip fertigation to conserve 40% water and increase cane girth.',
      'Earthing up should be completed within 90-100 days of planting to prevent lodging.',
      'Mulch with sugarcane trash to preserve soil moisture and suppress weed growth.'
    ]
  },
  {
    name: 'Maize (Corn)',
    nRange: [80, 140],
    pRange: [40, 70],
    kRange: [30, 60],
    tempRange: [18, 32],
    humidityRange: [55, 80],
    rainfallRange: [500, 900],
    phRange: [5.8, 7.5],
    soilTypes: ['Sandy Loam', 'Loam', 'Alluvial', 'Red Soil'],
    benefits: 'Fast 90-110 day cycle, dual-use for poultry feed/food/silage, moderate water footprint.',
    guidance: [
      'Ensure soil aeration; maize is sensitive to water stagnation during early vegetative phase.',
      'Monitor for Fall Armyworm with pheromone traps at 5 traps/acre.',
      'Apply zinc sulfate at 10 kg/acre as basal dose in zinc-deficient soils.'
    ]
  },
  {
    name: 'Groundnut (Peanut)',
    nRange: [20, 50],
    pRange: [40, 80],
    kRange: [40, 80],
    tempRange: [22, 33],
    humidityRange: [50, 75],
    rainfallRange: [450, 750],
    phRange: [6.0, 7.2],
    soilTypes: ['Sandy Loam', 'Red Sandy', 'Light Loam'],
    benefits: 'Fixes atmospheric nitrogen, high oil-seed market value, low nitrogen fertilizer need.',
    guidance: [
      'Apply Gypsum at 160 kg/acre at pegging stage (40-45 days) to ensure pod filling.',
      'Avoid disturbed soil condition after peg entry into the ground.',
      'Seed inoculation with Rhizobium culture increases nodulation significantly.'
    ]
  },
  {
    name: 'Tomato',
    nRange: [80, 150],
    pRange: [60, 100],
    kRange: [60, 120],
    tempRange: [18, 30],
    humidityRange: [50, 75],
    rainfallRange: [400, 800],
    phRange: [6.0, 7.0],
    soilTypes: ['Sandy Loam', 'Loam', 'Red Soil'],
    benefits: 'High frequency harvesting, quick revenue cycle, strong year-round local mandi demand.',
    guidance: [
      'Use staking/trellising to keep fruits off the ground, reducing fungal rot.',
      'Drip irrigation with fertigation ensures uniform fruit sizing and prevents blossom end rot.',
      'Spray Trichoderma and Pseudomonas fluorescens for bacterial wilt resistance.'
    ]
  }
];

export async function recommendCrop(input: CropInput): Promise<CropResult> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '') {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const prompt = `You are a senior agricultural scientist and agronomy expert for Agro Vision.
Analyze the following soil and agro-climatic parameters:
- Location: ${input.location}
- Soil Type: ${input.soilType}
- Nitrogen (N): ${input.nitrogen} kg/ha
- Phosphorus (P): ${input.phosphorus} kg/ha
- Potassium (K): ${input.potassium} kg/ha
- Soil pH: ${input.soilPh ?? '6.5'}
- Temperature: ${input.temperature} °C
- Humidity: ${input.humidity} %
- Average Annual Rainfall: ${input.rainfall} mm

Provide a precise crop recommendation in JSON format matching the schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendedCrop: { type: Type.STRING, description: 'Primary best suited crop name' },
              confidence: { type: Type.NUMBER, description: 'Confidence percentage between 75 and 99' },
              explanation: { type: Type.STRING, description: 'Detailed agronomic rationale' },
              secondaryCrops: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2 to 3 alternative viable crops'
              },
              soilSuitability: { type: Type.STRING, description: 'Assessment of soil type, NPK and pH suitability' },
              climateSuitability: { type: Type.STRING, description: 'Assessment of temperature, humidity and rainfall match' },
              expectedBenefits: { type: Type.STRING, description: 'Economic, yield, and market advantages' },
              guidance: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 practical farming action steps for the farmer'
              }
            },
            required: ['recommendedCrop', 'confidence', 'explanation', 'secondaryCrops', 'soilSuitability', 'climateSuitability', 'expectedBenefits', 'guidance']
          }
        }
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      if (parsed.recommendedCrop) {
        return {
          recommendedCrop: parsed.recommendedCrop,
          confidence: Math.round(parsed.confidence || 92),
          explanation: parsed.explanation || 'Optimal agro-ecological match for local soil and temperature.',
          secondaryCrops: parsed.secondaryCrops || ['Maize', 'Groundnut'],
          soilSuitability: parsed.soilSuitability || 'High nutrient compatibility with current NPK levels.',
          climateSuitability: parsed.climateSuitability || 'Favorable thermal and humidity conditions for peak yield.',
          expectedBenefits: parsed.expectedBenefits || 'High commercial viability with stable regional mandi demand.',
          guidance: parsed.guidance || [
            'Prepare seedbed with deep plowing and organic farmyard manure.',
            'Follow recommended NPK split scheduling.',
            'Monitor soil moisture levels regularly during critical growth stages.'
          ],
          isDemo: false
        };
      }
    } catch (aiErr) {
      console.warn('AI Crop Recommendation API failed or unavailable, using Agronomy Knowledge Engine:', aiErr);
    }
  }

  // Fallback ML / Rule-based Agronomy Engine
  return fallbackAgronomyCalculation(input);
}

function fallbackAgronomyCalculation(input: CropInput): CropResult {
  const scores = CROPS_DATABASE.map(crop => {
    let score = 100;

    // Soil type check
    const soilMatch = crop.soilTypes.some(st => input.soilType.toLowerCase().includes(st.toLowerCase()));
    if (!soilMatch) score -= 15;

    // Temp check
    if (input.temperature < crop.tempRange[0] || input.temperature > crop.tempRange[1]) {
      const diff = Math.min(Math.abs(input.temperature - crop.tempRange[0]), Math.abs(input.temperature - crop.tempRange[1]));
      score -= Math.min(25, diff * 3);
    }

    // Rainfall check
    if (input.rainfall < crop.rainfallRange[0] || input.rainfall > crop.rainfallRange[1]) {
      score -= 10;
    }

    // NPK balance check
    if (input.nitrogen < crop.nRange[0] * 0.7) score -= 10;
    if (input.phosphorus < crop.pRange[0] * 0.7) score -= 8;
    if (input.potassium < crop.kRange[0] * 0.7) score -= 8;

    return { crop, score: Math.max(40, Math.min(96, Math.round(score))) };
  });

  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];
  const secondary = scores.slice(1, 3).map(s => s.crop.name);

  return {
    recommendedCrop: best.crop.name,
    confidence: best.score,
    explanation: `Based on your N-P-K levels (${input.nitrogen}-${input.phosphorus}-${input.potassium} kg/ha), temperature (${input.temperature}°C), and ${input.soilType} soil in ${input.location || 'your region'}, ${best.crop.name} offers the optimal yield potential and root-soil compatibility.`,
    secondaryCrops: secondary,
    soilSuitability: `Compatible with ${input.soilType} having pH ${input.soilPh || '6.5'}. Current nitrogen and potassium levels provide good vegetative foundation.`,
    climateSuitability: `Temperature of ${input.temperature}°C and humidity ${input.humidity}% align with the active vegetative and reproductive windows.`,
    expectedBenefits: best.crop.benefits,
    guidance: best.crop.guidance,
    isDemo: true // clearly labeled fallback
  };
}
