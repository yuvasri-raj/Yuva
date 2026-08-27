import { GoogleGenAI } from '@google/genai';

interface SoilInput {
  nitrogen: number; // kg/ha
  phosphorus: number; // kg/ha
  potassium: number; // kg/ha
  ph: number;
  moisture: number; // %
  organicMatter: number; // %
  soilType: string;
}

export interface SoilAnalysisResult {
  healthScore: number;
  rating: 'Excellent' | 'Good' | 'Moderate' | 'Needs Improvement';
  nutrientStatus: {
    nitrogenStatus: string;
    phosphorusStatus: string;
    potassiumStatus: string;
    phStatus: string;
    moistureStatus: string;
    organicMatterStatus: string;
  };
  recommendations: string[];
  isDemo: boolean;
}

export async function analyzeSoilHealth(input: SoilInput): Promise<SoilAnalysisResult> {
  // Step 1: Algorithmic standard Agronomy index computation
  let score = 0;
  const recommendations: string[] = [];

  // 1. Nitrogen Evaluation (Ideal: 100 - 280 kg/ha)
  let nStatus = 'Optimal';
  if (input.nitrogen < 100) {
    nStatus = 'Low (Deficient)';
    score += 10;
    recommendations.push('Incorporate well-decomposed Farmyard Manure (FYM) @ 5 tonnes/acre and apply split dose of Neem-Coated Urea or Azotobacter culture.');
  } else if (input.nitrogen <= 280) {
    nStatus = 'Optimal (Healthy)';
    score += 20;
  } else {
    nStatus = 'High (Excess)';
    score += 14;
    recommendations.push('Reduce synthetic nitrogen fertilizers to prevent vegetative lushness and susceptibility to sucking pests.');
  }

  // 2. Phosphorus Evaluation (Ideal: 20 - 55 kg/ha)
  let pStatus = 'Optimal';
  if (input.phosphorus < 20) {
    pStatus = 'Low (Deficient)';
    score += 8;
    recommendations.push('Apply Single Super Phosphate (SSP) or rock phosphate combined with Phosphate Solubilizing Bacteria (PSB) @ 2 kg/acre.');
  } else if (input.phosphorus <= 55) {
    pStatus = 'Optimal (Healthy)';
    score += 20;
  } else {
    pStatus = 'High';
    score += 15;
  }

  // 3. Potassium Evaluation (Ideal: 110 - 280 kg/ha)
  let kStatus = 'Optimal';
  if (input.potassium < 110) {
    kStatus = 'Low (Deficient)';
    score += 8;
    recommendations.push('Apply Muriate of Potash (MOP) or Sulfate of Potash (SOP) to improve stalk strength and disease resistance.');
  } else if (input.potassium <= 280) {
    kStatus = 'Optimal (Healthy)';
    score += 20;
  } else {
    kStatus = 'High';
    score += 16;
  }

  // 4. pH Evaluation (Ideal: 6.0 - 7.5)
  let phStatus = 'Optimal';
  if (input.ph < 6.0) {
    phStatus = 'Acidic';
    score += (input.ph >= 5.2 ? 12 : 6);
    recommendations.push(`Soil is acidic (pH ${input.ph}). Broadcast Agricultural Lime (Calcium Carbonate) or Dolomite @ 200-400 kg/acre to neutralize acidity and enhance micronutrient availability.`);
  } else if (input.ph <= 7.5) {
    phStatus = 'Optimal (Neutral)';
    score += 20;
  } else {
    phStatus = 'Alkaline / Saline';
    score += (input.ph <= 8.5 ? 12 : 6);
    recommendations.push(`Soil is alkaline (pH ${input.ph}). Apply Agricultural Gypsum @ 300 kg/acre and green manure crops (Dhaincha/Sunhemp) to reclaim sodic properties.`);
  }

  // 5. Organic Matter Evaluation (Ideal: > 0.75%)
  let omStatus = 'Optimal';
  if (input.organicMatter < 0.5) {
    omStatus = 'Low (Poor)';
    score += 4;
    recommendations.push('Organic matter is critically low. Add vermicompost @ 2 tonnes/acre, apply bio-char, and practice green manuring with Sesbania to boost microbial biomass.');
  } else if (input.organicMatter <= 1.2) {
    omStatus = 'Moderate';
    score += 10;
  } else {
    omStatus = 'High (Rich)';
    score += 10;
  }

  // 6. Moisture Evaluation (Ideal: 40% - 75%)
  let mStatus = 'Optimal';
  if (input.moisture < 30) {
    mStatus = 'Low (Dry)';
    score += 4;
    recommendations.push('Moisture deficit detected. Mulch soil surface with crop residues or adopt micro-drip irrigation to conserve root zone moisture.');
  } else if (input.moisture <= 75) {
    mStatus = 'Good Moisture';
    score += 10;
  } else {
    mStatus = 'Waterlogged';
    score += 5;
    recommendations.push('Excess soil moisture. Construct surface drainage trenches to prevent root hypoxia and phytophthora root rot.');
  }

  const finalScore = Math.min(100, Math.max(25, Math.round(score)));

  let rating: 'Excellent' | 'Good' | 'Moderate' | 'Needs Improvement' = 'Good';
  if (finalScore >= 85) rating = 'Excellent';
  else if (finalScore >= 70) rating = 'Good';
  else if (finalScore >= 50) rating = 'Moderate';
  else rating = 'Needs Improvement';

  if (recommendations.length === 0) {
    recommendations.push('Maintain current balanced fertility with annual organic manure replenishment.', 'Follow crop rotation with legumes to sustain nitrogen levels.');
  }

  // Check if Gemini AI can provide enriched custom advisory
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  let isDemo = true;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '') {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const prompt = `As an agricultural soil fertility scientist, review this soil test:
- Soil Type: ${input.soilType}
- pH: ${input.ph}
- N-P-K: ${input.nitrogen} - ${input.phosphorus} - ${input.potassium} kg/ha
- Organic Matter: ${input.organicMatter}%
- Moisture: ${input.moisture}%
- Health Score: ${finalScore}/100 (${rating})

Provide 3 concise, highly actionable biological and mineral soil treatment recommendations for Indian farming conditions. Return pure text bullet points separated by newlines.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      if (response.text) {
        const lines = response.text.split('\n').map(l => l.replace(/^[*-•\d.]\s*/, '').trim()).filter(l => l.length > 10);
        if (lines.length >= 2) {
          recommendations.unshift(...lines.slice(0, 3));
          isDemo = false;
        }
      }
    } catch (err) {
      console.warn('Soil AI Enrichment skipped, using agronomy calculations:', err);
    }
  }

  return {
    healthScore: finalScore,
    rating,
    nutrientStatus: {
      nitrogenStatus: nStatus,
      phosphorusStatus: pStatus,
      potassiumStatus: kStatus,
      phStatus: phStatus,
      organicMatterStatus: omStatus,
      moistureStatus: mStatus
    },
    recommendations,
    isDemo
  };
}
