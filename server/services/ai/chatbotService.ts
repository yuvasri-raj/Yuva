import { GoogleGenAI } from '@google/genai';

interface ChatInput {
  message: string;
  language: 'en' | 'ta';
  conversationHistory?: Array<{ sender: 'user' | 'bot'; text: string }>;
}

export interface ChatbotResponse {
  reply: string;
  isDemo: boolean;
  language: 'en' | 'ta';
}

const FALLBACK_KNOWLEDGE: Array<{ keywords: string[]; en: string; ta: string }> = [
  {
    keywords: ['yellow', 'yellowing', 'leaves', 'leaf', 'இலை', 'மஞ்சள்'],
    en: 'Yellowing of leaves (chlorosis) usually points to Nitrogen deficiency if it starts from older bottom leaves, or Iron/Zinc deficiency if it appears in fresh upper leaves. It can also occur due to water stagnation or root rot. Recommendation: Apply a foliar spray of 1% Urea (10g/L) or Micronutrient mix (2g/L), and ensure good field drainage.',
    ta: 'இலைகள் மஞ்சள் நிறமாக மாறுவது (குளோரோசிஸ்) பொதுவாக நைட்ரஜன் குறைபாடு, இரும்பு/துத்தநாக குறைபாடு அல்லது அதிகப்படியான நீர் தேங்குவதால் ஏற்படுகிறது. பழைய கீழ் இலைகளில் தொடங்கினால் நைட்ரஜன் பற்றாக்குறை. தீர்வு: 1% யூரியா (10 கிராம்/லிட்டர்) அல்லது நுண்ணூட்டக்கலவை தெளிக்கவும் மற்றும் நிலத்தில் நீர் தேங்குவதை தவிர்க்கவும்.'
  },
  {
    keywords: ['scheme', 'subsidy', 'government', 'pm-kisan', 'மானியம்', 'திட்டம்', 'அரசு'],
    en: 'Key government agriculture schemes include: 1) PM-KISAN (₹6,000/year direct financial benefit in 3 installments), 2) Pradhan Mantri Fasal Bima Yojana (PMFBY) crop insurance at low premiums (1.5%-2%), 3) Sub-Mission on Agricultural Mechanization (up to 50% subsidy on tractors and implements), and 4) Soil Health Card Scheme. Visit our "Government Schemes" page in the navigation menu for direct eligibility and official portal links!',
    ta: 'முக்கிய வேளாண் திட்டங்கள்: 1) பி.எம்-கிசான் (ஆண்டுக்கு ₹6,000 நேரடி நிதி உதவி), 2) பிரதான் மந்திரி பயிர் காப்பீட்டுத் திட்டம் (PMFBY - குறைந்த பிரீமியத்தில் பயிர் இழப்பீடு), 3) வேளாண் இயந்திரமயமாக்கல் திட்டம் (50% வரை மானியம்), 4) மண் வள அட்டை திட்டம். மேலும் விவரங்களுக்கு நமது அரசு திட்டங்கள் பக்கத்தைப் பார்க்கவும்!'
  },
  {
    keywords: ['soil', 'ph', 'improve', 'fertility', 'மண்', 'வளம்', 'உரம்'],
    en: 'To improve soil health and fertility: 1) Incorporate organic matter like Vermicompost (2 tonnes/acre) or Farmyard Manure, 2) Test soil pH: apply Lime if acidic (pH < 6.0) or Gypsum if alkaline (pH > 7.5), 3) Practice crop rotation with leguminous crops like cowpea or green gram to fix atmospheric nitrogen, 4) Adopt mulching and biofertilizers (Azospirillum & Phosphobacteria).',
    ta: 'மண் வளத்தை மேம்படுத்த: 1) ஏக்கருக்கு 2 டன் மண்புழு உரம் அல்லது தொழுவுரம் இடவும், 2) மண் அமிலத்தன்மை கொண்டதாக இருந்தால் (pH < 6) சுண்ணாம்பு இடவும், காரத்தன்மை இருந்தால் ஜிப்சம் இடவும், 3) பயறு வகை பயிர்களுடன் பயிர் சுழற்சி செய்யவும், 4) அசோஸ்பைரில்லம் மற்றும் பாஸ்போபாக்டீரியா போன்ற உயிர் உரங்களைப் பயன்படுத்தவும்.'
  },
  {
    keywords: ['profit', 'calculate', 'cost', 'revenue', 'லாபம்', 'வருமானம்', 'செலவு'],
    en: 'Farming profit is calculated as: Total Revenue (Expected Yield in Quintals × Market Selling Price per Quintal) minus Total Cost (Seed + Fertilizer + Pesticides + Labour + Irrigation + Machinery/Other Expenses). Use our built-in "Profit Calculator" in the left sidebar to simulate and analyze your break-even yield and profit margins!',
    ta: 'விவசாய லாபக் கணக்கீடு: மொத்த வருவாய் (எதிர்பார்க்கப்படும் மகசூல் × சந்தை விலை) கழித்தல் மொத்த உற்பத்தி செலவு (விதை, உரம், பூச்சிக்கொல்லி, ஆட்கள் கூலி, பாசனம், இதர செலவுகள்). துல்லியமான லாப அளவைக் கணக்கிட நமது "Profit Calculator" கருவியைப் பயன்படுத்தவும்!'
  },
  {
    keywords: ['pest', 'insects', 'worm', 'neem', 'பூச்சி', 'புழு', 'வேப்ப எண்ணெய்'],
    en: 'For sustainable pest management: 1) Spray 5% Neem Seed Kernel Extract (NSKE) or Neem Oil (10,000 ppm) @ 3ml/L water as a natural repellent, 2) Install Yellow and Blue sticky traps (10 traps/acre) for whiteflies and thrips, 3) Install Pheromone traps for borer caterpillars, 4) Use bio-pesticides like Beauveria bassiana or Bacillus thuringiensis (Bt) before resorting to synthetic chemicals.',
    ta: 'இயற்கை பூச்சி மேலாண்மை: 1) 5% வேப்பங்கொட்டை சாறு அல்லது வேப்ப எண்ணெய் (3 மி.லி/லிட்டர்) தெளிக்கவும், 2) மஞ்சள்/நீல ஒட்டும் பொறிகளை ஏக்கருக்கு 10 அமைக்கவும், 3) காய்ப்புழுக்களுக்கு இனக்கவர்ச்சி பொறி வைக்கவும், 4) பவேரியா பேசியானா போன்ற உயிரியல் பூச்சிக்கொல்லிகளைப் பயன்படுத்தவும்.'
  },
  {
    keywords: ['fertilizer', 'npk', 'urea', 'dap', 'உரம்', 'யூரியா'],
    en: 'Balanced fertilizer management: Always split your Nitrogen (Urea) into 2-3 stages (basal, vegetative growth, and pre-flowering) rather than applying all at once. Phosphorus (DAP/SSP) should be applied as a single basal dose at root depth during planting. Potassium (MOP) strengthens plant stems and increases fruit weight. Supplement with bio-fertilizers to enhance absorption.',
    ta: 'சமச்சீர் உர மேலாண்மை: நைட்ரஜன் (யூரியா) உரத்தை ஒரே நேரத்தில் இடாமல் 2-3 தவணைகளாக பிரித்து இடவும். பாஸ்பரஸ் (DAP/SSP) உரத்தை விதைக்கும் போது அடியுரமாக மட்டுமே இட வேண்டும். பொட்டாஷ் உரம் தண்டு உறுதியை அதிகரித்து நோய் எதிர்ப்பு சக்தியைத் தரும்.'
  }
];

export async function chatWithAgroAssistant(input: ChatInput): Promise<ChatbotResponse> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '') {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const isTamil = input.language === 'ta';
      const systemInstruction = isTamil
        ? `நீங்கள் "Agro Vision" வேளாண் தளத்தின் நுண்ணறிவு உதவியாளர் (Agro Assistant). விவசாயிகளுக்கு பயிர் மேலாண்மை, பூச்சி/நோய் கட்டுப்பாடு, மண் வளம், உர கணக்கீடு, அரசு திட்டங்கள், சந்தை விலைகள் மற்றும் லாபத்தை அதிகரிக்க தெளிவான, மரியாதையான தமிழ் மொழியில் நடைமுறை வழிகாட்டுதல்களை வழங்கவும். பதில்கள் சுருக்கமாகவும், புள்ளிகளாகவும் பயனுள்ளதாகவும் இருக்க வேண்டும்.`
        : `You are "Agro Assistant", the dedicated smart agriculture AI companion for the Agro Vision platform. You provide friendly, scientifically accurate, practical agricultural advice to farmers on crops, plant diseases, soil health, fertilizer scheduling, organic methods, government schemes, market economics, and profit optimization. Format replies with clear headings and bullet points where helpful.`;

      let prompt = input.message;
      if (input.conversationHistory && input.conversationHistory.length > 0) {
        const historyText = input.conversationHistory
          .slice(-4)
          .map(h => `${h.sender === 'user' ? 'Farmer' : 'Agro Assistant'}: ${h.text}`)
          .join('\n');
        prompt = `Previous conversation context:\n${historyText}\n\nFarmer's current question: ${input.message}`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });

      if (response.text) {
        return {
          reply: response.text.trim(),
          isDemo: false,
          language: input.language
        };
      }
    } catch (err) {
      console.warn('Gemini Chatbot API error, using agricultural knowledge engine:', err);
    }
  }

  // Fallback agricultural domain expert response
  const lowerMsg = input.message.toLowerCase();
  const matched = FALLBACK_KNOWLEDGE.find(k => k.keywords.some(kw => lowerMsg.includes(kw.toLowerCase())));

  let replyText = '';
  if (matched) {
    replyText = input.language === 'ta' ? matched.ta : matched.en;
  } else {
    replyText = input.language === 'ta'
      ? `வணக்கம்! நான் Agro Vision வேளாண் உதவியாளர். பயிர் பரிந்துரை, இலை நோய் கண்டறிதல், மண் பரிசோதனை, அரசு மானியங்கள் அல்லது சந்தை விலைகள் குறித்து என்னிடம் கேளுங்கள். உங்கள் கேள்விக்கு உதவ தயாராக உள்ளேன்!`
      : `Hello! I am your Agro Vision Assistant. You can ask me about crop selection, identifying plant leaf diseases, soil fertility tips, government agricultural subsidies, mandi market prices, or farming profit calculations. How can I assist your farm today?`;
  }

  return {
    reply: replyText,
    isDemo: true, // clearly indicated fallback
    language: input.language
  };
}
