import bcrypt from 'bcryptjs';
import { db } from './config/db.js';
import { IUser, IGovernmentScheme, IMarketPrice, ICommunityPost, IComment } from './models/index.js';

export async function seedDatabase() {
  const usersColl = db.collection<IUser>('users');
  const schemesColl = db.collection<IGovernmentScheme>('governmentSchemes');
  const marketColl = db.collection<IMarketPrice>('marketPrices');
  const communityColl = db.collection<ICommunityPost>('communityPosts');
  const commentsColl = db.collection<IComment>('comments');

  // Seed Users if none exist
  if (usersColl.count() === 0) {
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    const farmerPasswordHash = await bcrypt.hash('Farmer@123', 10);

    const adminUser = usersColl.insertOne({
      _id: 'user_admin_001',
      name: 'Dr. R. Ramanathan',
      email: 'admin@agrovision.gov.in',
      phone: '+91 98450 12345',
      passwordHash: adminPasswordHash,
      role: 'admin',
      state: 'Tamil Nadu',
      district: 'Coimbatore',
      location: 'TNAU Campus, Coimbatore',
      preferredLanguage: 'en',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });

    const demoFarmer = usersColl.insertOne({
      _id: 'user_farmer_001',
      name: 'M. Yuvasri',
      email: 'farmer@agrovision.com',
      phone: '+91 97890 54321',
      passwordHash: farmerPasswordHash,
      role: 'farmer',
      state: 'Tamil Nadu',
      district: 'Coimbatore',
      location: 'Pollachi, Coimbatore',
      preferredLanguage: 'en',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    });

    console.log('✅ Seeded default Admin and Farmer users.');
  }

  // Seed Government Schemes
  if (schemesColl.count() === 0) {
    const schemes: Omit<IGovernmentScheme, '_id' | 'createdAt'>[] = [
      {
        schemeName: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
        description: 'Direct income support of ₹6,000 per annum provided to all landholding farmer families across the nation in three equal four-monthly installments of ₹2,000 directly into Aadhaar-linked bank accounts.',
        eligibility: [
          'All landholding small and marginal farmer families with cultivable land in their names',
          'Valid Aadhaar card and active DBT-enabled bank account',
          'Excludes institutional landholders and constitutional post holders'
        ],
        benefits: '₹6,000 annually in 3 installments (₹2,000 every 4 months) through Direct Benefit Transfer (DBT).',
        documentsRequired: [
          'Aadhaar Card',
          'Land ownership documents (Patta / Chitta / 7/12 extract / RoR)',
          'Bank Passbook copy with IFSC',
          'Mobile number linked to Aadhaar'
        ],
        applicationProcess: 'Farmers can self-register through the PM-KISAN online portal (pmkisan.gov.in), through the PM-KISAN mobile app, or via nearest Common Service Centres (CSC) / Village Administrative Officer (VAO).',
        officialLink: 'https://pmkisan.gov.in',
        state: 'All India',
        category: 'Direct Income Support',
        farmerCategory: 'Small, Marginal & Medium Farmers',
        fundingAmount: '₹6,000 / year'
      },
      {
        schemeName: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        description: 'Comprehensive yield and crop insurance protection covering all non-preventable natural risks (drought, flood, unseasonal rains, pest epidemics) from pre-sowing to post-harvest stages at nominal premium rates.',
        eligibility: [
          'All farmers growing notified crops in notified areas (both loanee and non-loanee)',
          'Sharecroppers and tenant farmers with valid tenancy certificates are eligible'
        ],
        benefits: 'Low premium: 2% for Kharif crops, 1.5% for Rabi food/oilseeds crops, and 5% for commercial/horticultural crops. 100% loss compensation directly into bank account.',
        documentsRequired: [
          'Land Sowing Certificate / Adangal',
          'Aadhaar Card and Land Record (Patta/Khasra)',
          'Bank Account Passbook',
          'Kisan Credit Card (KCC) details (if loanee farmer)'
        ],
        applicationProcess: 'Apply online on the National Crop Insurance Portal (pmfby.gov.in), through designated commercial/cooperative banks, or via Village Agricultural Extension offices.',
        officialLink: 'https://pmfby.gov.in',
        state: 'All India',
        category: 'Crop Insurance',
        farmerCategory: 'All Farmers',
        fundingAmount: 'Full Crop Loss Compensation'
      },
      {
        schemeName: 'Sub-Mission on Agricultural Mechanization (SMAM)',
        description: 'Financial assistance and capital subsidy for purchasing modern farm machinery, tractors, power tillers, drone sprayers, harvesters, and establishing Custom Hiring Centres (CHCs).',
        eligibility: [
          'Individual farmers, self-help groups (SHGs), and Farmer Producer Organizations (FPOs)',
          'Higher subsidy priority given to Small/Marginal, Women, and SC/ST farmers'
        ],
        benefits: '40% to 50% subsidy on purchase price of agricultural implements and up to 80% subsidy for setting up village-level Custom Hiring Centres.',
        documentsRequired: [
          'Aadhaar Card',
          'Land holding certificate',
          'Quotation from authorized implement dealer',
          'Bank Account details and PAN Card'
        ],
        applicationProcess: 'Apply on state agri-machinery portals (e.g., Agrimachinery portal agrimachinery.nic.in) or state agriculture engineering department offices.',
        officialLink: 'https://agrimachinery.nic.in',
        state: 'All India',
        category: 'Subsidy & Machinery',
        farmerCategory: 'Individual Farmers & FPOs',
        fundingAmount: 'Up to 50% Capital Subsidy'
      },
      {
        schemeName: 'Soil Health Card (SHC) Scheme',
        description: 'Periodic soil testing providing farmers with a customized Soil Health Card containing nutrient status (12 parameters: N, P, K, S, Zn, Fe, Cu, Mn, B, pH, EC, OC) and crop-wise dosage recommendations.',
        eligibility: [
          'All farmers across all agro-climatic zones in India',
          'Issued free of cost or at heavily subsidized testing rates every 2 years'
        ],
        benefits: 'Reduces fertilizer wastage by 15-20%, increases crop productivity by 8-12%, and prevents soil degradation.',
        documentsRequired: [
          'Land Survey / Patta number',
          'Soil sample collected by village agricultural assistant',
          'Aadhaar Card and contact phone number'
        ],
        applicationProcess: 'Soil samples are collected by agriculture department field staff or farmers can deposit samples at the nearest Soil Testing Laboratory (STL) or Krishi Vigyan Kendra (KVK).',
        officialLink: 'https://soilhealth.dac.gov.in',
        state: 'All India',
        category: 'Soil & Irrigation',
        farmerCategory: 'All Landholding Farmers',
        fundingAmount: 'Free Soil Testing & Card'
      },
      {
        schemeName: 'Agriculture Infrastructure Fund (AIF)',
        description: 'Medium-long term debt financing facility for investment in viable post-harvest management infrastructure like solar cold storage, warehouses, sorting/grading units, and primary processing.',
        eligibility: [
          'Primary Agricultural Credit Societies (PACS), FPOs, Agri-entrepreneurs, and Startups',
          'Individual farmers investing in farm-gate infrastructure'
        ],
        benefits: 'Interest subvention of 3% per annum up to a limit of ₹2 Crore for up to 7 years, along with CGTMSE credit guarantee coverage.',
        documentsRequired: [
          'Detailed Project Report (DPR)',
          'KYC Documents and Land Documents',
          'Bank Loan Application details'
        ],
        applicationProcess: 'Submit project proposal on the central AIF portal (agriinfra.dac.gov.in) with subsequent approval by lending commercial bank.',
        officialLink: 'https://agriinfra.dac.gov.in',
        state: 'All India',
        category: 'Credit & Loan',
        farmerCategory: 'Agri-entrepreneurs & FPOs',
        fundingAmount: 'Loans up to ₹2 Cr with 3% interest relief'
      },
      {
        schemeName: 'Tamil Nadu Micro Irrigation Scheme (TN-IAMWARM / PMKSY)',
        description: 'Special state-supplemented subsidy program providing 100% subsidy for Small & Marginal farmers and 75% subsidy for other farmers installing Drip & Sprinkler irrigation systems.',
        eligibility: [
          'Farmers in Tamil Nadu with assured irrigation source (well/borewell)',
          'Valid Patta and land passbook'
        ],
        benefits: '100% complete subsidy on drip systems for small & marginal farmers (< 5 acres); 75% subsidy for large farmers.',
        documentsRequired: [
          'Land Patta, Chitta, FMB sketch',
          'Water and Electricity Availability Certificate',
          'Aadhaar Card and Soil Test Report'
        ],
        applicationProcess: 'Register on Tamil Nadu TNHORT / Uzhavan mobile application or submit application to Assistant Director of Horticulture (ADH) at block level.',
        officialLink: 'https://tnhorticulture.tn.gov.in',
        state: 'Tamil Nadu',
        category: 'Soil & Irrigation',
        farmerCategory: 'Small, Marginal & General Farmers',
        fundingAmount: '100% Subsidy for Small Farmers'
      },
      {
        schemeName: 'Paramparagat Krishi Vikas Yojana (PKVY) - Organic Farming',
        description: 'Comprehensive cluster-based support for adoption of certified organic farming, natural inputs preparation (Jeevamarutham), PGS certification, and organic marketing linkages.',
        eligibility: [
          'Farmer clusters comprising at least 20-50 hectares',
          'Farmers willing to commit to chemical-free agriculture'
        ],
        benefits: '₹50,000 per hectare over 3 years, of which ₹31,000/ha is directly given for organic seeds, bio-fertilizers, and botanical extracts.',
        documentsRequired: [
          'Cluster farmer group agreement',
          'Aadhaar and Land Records of cluster members',
          'Bank account of the farmer cluster group'
        ],
        applicationProcess: 'Form a village farmer group and enroll through the Block Agriculture Office or Krishi Vigyan Kendra (KVK).',
        officialLink: 'https://pgsindia-ncof.gov.in',
        state: 'All India',
        category: 'Organic Farming',
        farmerCategory: 'Farmer Groups & Clusters',
        fundingAmount: '₹50,000 / hectare over 3 years'
      }
    ];

    schemesColl.insertMany(schemes);
    console.log('✅ Seeded official Government Schemes.');
  }

  // Seed Market Prices
  if (marketColl.count() === 0) {
    const today = new Date().toISOString().split('T')[0];
    const prices: Omit<IMarketPrice, '_id' | 'createdAt'>[] = [
      {
        cropName: 'Paddy (Common)',
        marketName: 'Pollachi Regulated Market',
        location: 'Pollachi',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        price: 2450,
        unit: 'Quintal (100 kg)',
        date: today,
        source: 'Regulated Mandi Daily Bulletin (Agmarknet)',
        msp: 2300,
        trend: 'up',
        changePercentage: 3.4
      },
      {
        cropName: 'Paddy (Basmati)',
        marketName: 'Karnal Grain Mandi',
        location: 'Karnal',
        district: 'Karnal',
        state: 'Haryana',
        price: 3850,
        unit: 'Quintal (100 kg)',
        date: today,
        source: 'Agmarknet APMC Feed',
        msp: 3100,
        trend: 'up',
        changePercentage: 2.1
      },
      {
        cropName: 'Wheat (Sharbati)',
        marketName: 'Sehore Krishi Mandi',
        location: 'Sehore',
        district: 'Sehore',
        state: 'Madhya Pradesh',
        price: 2680,
        unit: 'Quintal (100 kg)',
        date: today,
        source: 'e-NAM Central Platform',
        msp: 2275,
        trend: 'stable',
        changePercentage: 0.5
      },
      {
        cropName: 'Cotton (Medium Staple)',
        marketName: 'Rajkot APMC Market',
        location: 'Rajkot',
        district: 'Rajkot',
        state: 'Gujarat',
        price: 7420,
        unit: 'Quintal (100 kg)',
        date: today,
        source: 'Cotton Corporation of India & APMC',
        msp: 7122,
        trend: 'up',
        changePercentage: 4.2
      },
      {
        cropName: 'Sugarcane',
        marketName: 'Erode Cane Procurement Hub',
        location: 'Erode',
        district: 'Erode',
        state: 'Tamil Nadu',
        price: 340,
        unit: 'Quintal (100 kg)',
        date: today,
        source: 'State Sugarcane Price Board (FRP)',
        msp: 315,
        trend: 'stable',
        changePercentage: 0.0
      },
      {
        cropName: 'Maize (Hybrid Corn)',
        marketName: 'Davanagere APMC',
        location: 'Davanagere',
        district: 'Davanagere',
        state: 'Karnataka',
        price: 2240,
        unit: 'Quintal (100 kg)',
        date: today,
        source: 'e-NAM Mandi Network',
        msp: 2090,
        trend: 'down',
        changePercentage: -1.8
      },
      {
        cropName: 'Tomato (Hybrid Red)',
        marketName: 'Madanapalle Tomato Yard',
        location: 'Madanapalle',
        district: 'Chittoor',
        state: 'Andhra Pradesh',
        price: 1850,
        unit: 'Quintal (100 kg)',
        date: today,
        source: 'Daily Yard Auction Bulletin',
        msp: 1200,
        trend: 'up',
        changePercentage: 8.5
      },
      {
        cropName: 'Onion (Nashik Red)',
        marketName: 'Lasalgaon APMC',
        location: 'Lasalgaon',
        district: 'Nashik',
        state: 'Maharashtra',
        price: 2150,
        unit: 'Quintal (100 kg)',
        date: today,
        source: 'Lasalgaon Mandi Daily Index',
        msp: 1600,
        trend: 'up',
        changePercentage: 5.1
      },
      {
        cropName: 'Groundnut (Pods)',
        marketName: 'Tiruvannamalai Regulated Market',
        location: 'Tiruvannamalai',
        district: 'Tiruvannamalai',
        state: 'Tamil Nadu',
        price: 6850,
        unit: 'Quintal (100 kg)',
        date: today,
        source: 'Agmarknet Bulletin',
        msp: 6377,
        trend: 'up',
        changePercentage: 1.9
      },
      {
        cropName: 'Turmeric (Finger)',
        marketName: 'Erode Turmeric Market',
        location: 'Erode',
        district: 'Erode',
        state: 'Tamil Nadu',
        price: 14200,
        unit: 'Quintal (100 kg)',
        date: today,
        source: 'Erode Turmeric Merchants Association',
        msp: 9500,
        trend: 'up',
        changePercentage: 6.8
      }
    ];

    marketColl.insertMany(prices);
    console.log('✅ Seeded Mandi Market Prices.');
  }

  // Seed Community Posts
  if (communityColl.count() === 0) {
    const post1 = communityColl.insertOne({
      _id: 'post_001',
      userId: 'user_farmer_001',
      userName: 'M. Yuvasri',
      userRole: 'Farmer',
      userLocation: 'Pollachi, Tamil Nadu',
      title: 'Successful organic control of Fall Armyworm in Maize using Trichogramma cards',
      content: 'Hello fellow farmers! Last season we faced heavy Armyworm attack on our 3-acre maize crop. Instead of synthetic spray, we released Trichogramma chilonis egg parasitoid cards (2 cards/acre) at 15-day intervals along with 5% Neem oil. The larval infestation dropped by 85% within 12 days without killing pollinating bees. Highly recommend giving this biological approach a try!',
      category: 'Disease',
      likes: ['user_admin_001'],
      commentsCount: 2,
      imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&auto=format&fit=crop&q=80',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
    });

    const post2 = communityColl.insertOne({
      _id: 'post_002',
      userId: 'user_admin_001',
      userName: 'Dr. R. Ramanathan (TNAU)',
      userRole: 'Agriculture Officer',
      userLocation: 'Coimbatore, Tamil Nadu',
      title: 'Advisory: Soil Health & Gypsum Application before Kharif Sowing',
      content: 'Farmers in Western Tamil Nadu and Karnataka regions with alkaline soils (pH > 7.8) are advised to broadcast agricultural gypsum at 300 kg/acre prior to first preparatory plowing. This dramatically improves water infiltration and frees immobilized Phosphorus. Soil Health Cards can be renewed at block KVK centers.',
      category: 'Soil',
      likes: ['user_farmer_001'],
      commentsCount: 1,
      imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&auto=format&fit=crop&q=80',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 4).toISOString()
    });

    const post3 = communityColl.insertOne({
      _id: 'post_003',
      userId: 'user_farmer_001',
      userName: 'M. Yuvasri',
      userRole: 'Farmer',
      userLocation: 'Pollachi, Tamil Nadu',
      title: 'Current Turmeric price boom in Erode Mandi: Best time to harvest & cure',
      content: 'Turmeric finger variety touched ₹14,200/quintal in today auction. For those boiling and drying turmeric now, make sure moisture content is brought down to exactly 9-10% to prevent fungal storage rot and secure top grade bidding.',
      category: 'Market',
      likes: [],
      commentsCount: 0,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
    });

    // Seed sample comments
    commentsColl.insertOne({
      _id: 'comment_001',
      postId: 'post_001',
      userId: 'user_admin_001',
      userName: 'Dr. R. Ramanathan (TNAU)',
      comment: 'Excellent biological pest management initiative! Releasing parasitoids during morning hours yields the highest survival rates.',
      createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString()
    });

    commentsColl.insertOne({
      _id: 'comment_002',
      postId: 'post_001',
      userId: 'user_farmer_001',
      userName: 'M. Yuvasri',
      comment: 'Thank you doctor! We also kept yellow sticky traps at field borders which caught flying moths effectively.',
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
    });

    commentsColl.insertOne({
      _id: 'comment_003',
      postId: 'post_002',
      userId: 'user_farmer_001',
      userName: 'M. Yuvasri',
      comment: 'Does gypsum application interfere with Single Super Phosphate (SSP) basal dosage?',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    });

    console.log('✅ Seeded Community Posts & Comments.');
  }

  // Seed sample initial notifications for demo farmer
  const notifColl = db.collection('notifications');
  if (notifColl.count() === 0) {
    notifColl.insertMany([
      {
        userId: 'user_farmer_001',
        title: '🌱 Kharif Crop Sowing Window Open',
        message: 'Optimal weather and soil moisture forecast in Coimbatore district for Maize and Groundnut.',
        type: 'crop',
        read: false,
        link: '/crop-recommendation'
      },
      {
        userId: 'user_farmer_001',
        title: '💰 Turmeric Market Surge Alert',
        message: 'Erode Mandi prices increased by +6.8% today, reaching ₹14,200/quintal.',
        type: 'market',
        read: false,
        link: '/market-prices'
      },
      {
        userId: 'user_farmer_001',
        title: '🏛️ New Subsidy: 100% Drip Irrigation',
        message: 'Tamil Nadu Micro Irrigation Scheme open for small and marginal landholders.',
        type: 'scheme',
        read: true,
        link: '/government-schemes'
      }
    ]);
    console.log('✅ Seeded Notifications.');
  }
}
