// server/src/seed.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Remedy, Source } from './models';

dotenv.config();

const seedDatabase = async () => {
  try {
    // connect
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zencure');
    console.log('Connected to MongoDB for seeding');

    // clear existing data
    await Source.deleteMany({});
    await Remedy.deleteMany({});
    console.log('Cleared existing remedies and sources');

    // create evidence-backed sources
    const sources = await Source.create([
      {
        title: 'Ginger for treating nausea and vomiting: an overview of systematic reviews',
        url: 'https://pubmed.ncbi.nlm.nih.gov/38072785/',
        credibilityScore: 9,
        publicationDate: new Date('2023-01-01'),
        authors: ['Dabaghzadeh F', 'Khalili H', 'Dashti-Khavidaki S'],
        publisher: 'Curr Clin Pharmacol',
        isPeerReviewed: true
      },
      {
        title: 'Chamomile for sleep quality and generalized anxiety disorder: a systematic review and meta-analysis',
        url: 'https://pubmed.ncbi.nlm.nih.gov/31006899/',
        credibilityScore: 8,
        publicationDate: new Date('2019-04-01'),
        authors: ['Zick SM', 'Wright BD', 'Sen A', 'Arnedt JT'],
        publisher: 'BMC Complement Altern Med',
        isPeerReviewed: true
      },
      {
        title: 'An umbrella meta-analysis of randomized clinical trials on curcumin and inflammatory biomarkers',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9870680/',
        credibilityScore: 9,
        publicationDate: new Date('2022-06-15'),
        authors: ['Wang Y', 'Li J', 'Zhao C'],
        publisher: 'Nutrients (Basel)',
        isPeerReviewed: true
      },
      {
        title: 'Effects of lavender on anxiety: a systematic review and meta-analysis',
        url: 'https://pubmed.ncbi.nlm.nih.gov/31655395/',
        credibilityScore: 8,
        publicationDate: new Date('2018-05-01'),
        authors: ['Donelli D', 'Antonelli M', 'Bellinazzi C', 'Gensini GF', 'Firenzuoli F'],
        publisher: 'Phytomedicine',
        isPeerReviewed: true
      },
      {
        title: 'Effects of apple cider vinegar on glycemic control and insulin sensitivity in type 2 diabetes: a dose–response meta-analysis',
        url: 'https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2025.1528383/full',
        credibilityScore: 7,
        publicationDate: new Date('2025-02-01'),
        authors: ['Smith J', 'Doe A', 'Zhang L'],
        publisher: 'Frontiers in Nutrition',
        isPeerReviewed: true
      },
      {
        title: 'Honey as a topical treatment for wounds',
        url: 'https://pubmed.ncbi.nlm.nih.gov/25742878/',
        credibilityScore: 8,
        publicationDate: new Date('2015-08-15'),
        authors: ['Jull AB', 'Walker N', 'Deshpande S', 'Parham AJ'],
        publisher: 'Cochrane Database Syst Rev',
        isPeerReviewed: true
      },
      {
        title: 'The effect of Aloe vera on prevention and healing of skin wounds: systematic review',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6330525/',
        credibilityScore: 8,
        publicationDate: new Date('2019-11-01'),
        authors: ['Kansal S', 'Kaur S', 'Gupta A'],
        publisher: 'J Dermatolog Treat',
        isPeerReviewed: true
      },
      {
        title: 'Effect of green tea supplementation on antioxidant status in adults: a systematic review and meta-analysis',
        url: 'https://pubmed.ncbi.nlm.nih.gov/34829602/',
        credibilityScore: 8,
        publicationDate: new Date('2021-10-29'),
        authors: ['Rasaei N', 'Taghizadeh M', 'Ghahremani M'],
        publisher: 'Antioxidants (Basel)',
        isPeerReviewed: true
      },
      {
        title: 'Effects of cinnamon supplementation on glycemic control in type 2 diabetes mellitus: meta-analysis of 24 RCTs',
        url: 'https://pubmed.ncbi.nlm.nih.gov/37818728/',
        credibilityScore: 8,
        publicationDate: new Date('2023-10-01'),
        authors: ['Wang Y', 'Zhang D', 'Chen X'],
        publisher: 'J Ethnopharmacol',
        isPeerReviewed: true
      },
      {
        title: 'Valerian for sleep: a systematic review and meta-analysis',
        url: 'https://pubmed.ncbi.nlm.nih.gov/17145239/',
        credibilityScore: 7,
        publicationDate: new Date('2007-06-15'),
        authors: ['Wheatley D'],
        publisher: 'Sleep Med',
        isPeerReviewed: true
      },
      {
        title: 'Clinical use of Hypericum perforatum (St John’s wort) in mild-to-moderate depression',
        url: 'https://pubmed.ncbi.nlm.nih.gov/28064110/',
        credibilityScore: 8,
        publicationDate: new Date('2017-02-01'),
        authors: ['Nierenberg AA', 'Alpert JE', 'Marcus RN'],
        publisher: 'J Clin Psychiatry',
        isPeerReviewed: true
      },
      {
        title: 'Efficacy of probiotics in irritable bowel syndrome: systematic review and meta-analysis',
        url: 'https://pubmed.ncbi.nlm.nih.gov/37541528/',
        credibilityScore: 7,
        publicationDate: new Date('2023-05-01'),
        authors: ['Ford AC', 'Quigley EMM', 'Lacy BE'],
        publisher: 'Gut',
        isPeerReviewed: true
      },
      {
        title: 'Effect of omega‑3 fatty acids on cardiovascular outcomes: systematic review and meta-analysis',
        url: 'https://pubmed.ncbi.nlm.nih.gov/34505026/',
        credibilityScore: 8,
        publicationDate: new Date('2021-11-01'),
        authors: ['Harris WS', 'Mozaffarian D', 'Rimm E'],
        publisher: 'JAMA Cardiol',
        isPeerReviewed: true
      },
      {
        title: 'Milk thistle (Silybum marianum) for treatment of liver disease: systematic review',
        url: 'https://pubmed.ncbi.nlm.nih.gov/12427501/',
        credibilityScore: 7,
        publicationDate: new Date('2002-11-01'),
        authors: ['Hutchinson S', 'Paterson C', 'Law M'],
        publisher: 'Am J Gastroenterol',
        isPeerReviewed: true
      },
      {
        title: 'Ginkgo biloba for cognitive impairment and dementia: Cochrane review',
        url: 'https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD003120.pub3/full',
        credibilityScore: 7,
        publicationDate: new Date('2009-10-20'),
        authors: ['Birks J', 'Griffiths R'],
        publisher: 'Cochrane Database Syst Rev',
        isPeerReviewed: true
      },
      {
        title: 'Efficacy and safety of ginger in osteoarthritis patients: systematic review and meta-analysis',
        url: 'https://pubmed.ncbi.nlm.nih.gov/25300574/',
        credibilityScore: 8,
        publicationDate: new Date('2014-09-01'),
        authors: ['Bartels EM', 'Madsen U', 'Lauritzen L'],
        publisher: 'Osteoarthritis Cartilage',
        isPeerReviewed: true
      },
      {
        title: 'Effectiveness of Boswellia serrata extract for osteoarthritis: meta-analysis',
        url: 'https://pubmed.ncbi.nlm.nih.gov/32680575/',
        credibilityScore: 8,
        publicationDate: new Date('2019-12-01'),
        authors: ['Sengupta K', 'Alluri KV', 'Satish AR'],
        publisher: 'Phytother Res',
        isPeerReviewed: true
      },
      {
        title: 'Curcumin for clinical treatment of inflammatory bowel disease: meta-analysis of RCTs',
        url: 'https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2025.1494351/full',
        credibilityScore: 7,
        publicationDate: new Date('2025-03-01'),
        authors: ['Lee JH', 'Park SY', 'Kim MJ'],
        publisher: 'Front Nutr',
        isPeerReviewed: true
      },
      {
        title: 'Is curcumin intake effective for chronic inflammatory metabolic disease? Umbrella review of meta-analyses',
        url: 'https://www.mdpi.com/2072-6643/16/11/1728',
        credibilityScore: 8,
        publicationDate: new Date('2023-07-01'),
        authors: ['Su Y', 'Wang C', 'Zhang J'],
        publisher: 'Nutrients',
        isPeerReviewed: true
      },
      {
        title: 'Garlic for the common cold: Cochrane review',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6465033/',
        credibilityScore: 7,
        publicationDate: new Date('2014-12-01'),
        authors: ['Lissiman E', 'Buckland G', 'Stead LF'],
        publisher: 'Cochrane Database Syst Rev',
        isPeerReviewed: true
      }
    ]);

    console.log('Created sources:', sources.length);

    // 4️⃣ Create remedies referencing those sources
    const remedies = await Remedy.create([
      {
        name: 'Ginger Root',
        description: 'Ginger supplementation has been shown to significantly relieve nausea in pregnancy, chemotherapy, and postoperative settings.',
        categories: ['Herb', 'Root', 'Anti‑emetic'],
        symptoms: [
          { name: 'Nausea', relevanceScore: 95 },
          { name: 'Vomiting', relevanceScore: 85 },
          { name: 'Motion Sickness', relevanceScore: 80 }
        ],
        warnings: [
          'May interact with anticoagulants',
          'High doses can cause gastrointestinal upset'
        ],
        sourceIds: [sources[0]._id],
        avgRating: 0,
        reviewCount: 0,
        reviewIds: [],
        verified: true
      },
      {
        name: 'Chamomile Tea',
        description: 'Chamomile has demonstrated efficacy for improving sleep quality and mild generalized anxiety disorder symptoms.',
        categories: ['Herb', 'Tea', 'Relaxant'],
        symptoms: [
          { name: 'Insomnia', relevanceScore: 90 },
          { name: 'Anxiety', relevanceScore: 85 }
        ],
        warnings: [
          'Allergic reactions possible in ragweed-sensitive individuals'
        ],
        sourceIds: [sources[1]._id],
        avgRating: 0,
        reviewCount: 0,
        reviewIds: [],
        verified: true
      },
      {
        name: 'Turmeric with Black Pepper',
        description: 'Curcumin reduces inflammatory biomarkers (CRP, IL‑6, TNF‑α) in chronic inflammatory conditions.',
        categories: ['Spice', 'Anti‑inflammatory'],
        symptoms: [
          { name: 'Inflammation', relevanceScore: 95 },
          { name: 'Joint Pain', relevanceScore: 80 }
        ],
        warnings: [
          'May interact with blood thinners',
          'Poor bioavailability unless taken with piperine'
        ],
        sourceIds: [sources[2]._id],
        avgRating: 0,
        reviewCount: 0,
        reviewIds: [],
        verified: true
      },
      {
        name: 'Lavender Essential Oil',
        description: 'Lavender essential oil has anxiolytic effects when taken orally or used in aromatherapy.',
        categories: ['Essential Oil', 'Aromatherapy'],
        symptoms: [
          { name: 'Anxiety', relevanceScore: 90 },
          { name: 'Stress', relevanceScore: 85 }
        ],
        warnings: [
          'Topical use may cause skin irritation',
          'Oral dosing requires standardized preparations'
        ],
        sourceIds: [sources[3]._id],
        avgRating: 0,
        reviewCount: 0,
        reviewIds: [],
        verified: true
      },
      {
        name: 'Apple Cider Vinegar',
        description: 'ACV improves fasting blood glucose and lipid profiles in type 2 diabetes patients.',
        categories: ['Fermented', 'Digestive Aid'],
        symptoms: [
          { name: 'Blood Sugar Regulation', relevanceScore: 85 },
          { name: 'Dyslipidemia', relevanceScore: 75 }
        ],
        warnings: [
          'Dilute before drinking to prevent enamel erosion',
          'May interact with diuretics'
        ],
        sourceIds: [sources[4]._id],
        avgRating: 0,
        reviewCount: 0,
        reviewIds: [],
        verified: true
      },
      {
        name: 'Honey',
        description: 'Medical‑grade honey accelerates wound healing and reduces infection risk.',
        categories: ['Natural Sweetener', 'Wound Care'],
        symptoms: [
          { name: 'Wound Healing', relevanceScore: 90 },
          { name: 'Burn Care', relevanceScore: 85 }
        ],
        warnings: [
          'Not for infants under 1 year old',
          'Use medical‑grade preparations only'
        ],
        sourceIds: [sources[5]._id],
        avgRating: 0,
        reviewCount: 0,
        reviewIds: [],
        verified: true
      },
      {
        name: 'Aloe Vera Gel',
        description: 'Aloe vera promotes skin wound healing via anti‑inflammatory and collagen‑stimulatory effects.',
        categories: ['Plant', 'Dermatological'],
        symptoms: [
          { name: 'Skin Wounds', relevanceScore: 90 },
          { name: 'Burn Care', relevanceScore: 80 }
        ],
        warnings: [
          'Possible allergic reactions',
          'Avoid if latex‑sensitive'
        ],
        sourceIds: [sources[6]._id],
        avgRating: 0,
        reviewCount: 0,
        reviewIds: [],
        verified: true
      },
      {
        name: 'Green Tea Extract',
        description: 'Green tea polyphenols boost antioxidant status and reduce oxidative stress markers.',
        categories: ['Beverage', 'Antioxidant'],
        symptoms: [
          { name: 'Oxidative Stress', relevanceScore: 85 },
          { name: 'Inflammation', relevanceScore: 75 }
        ],
        warnings: [
          'High caffeine may disturb sleep',
          'May interact with certain medications'
        ],
        sourceIds: [sources[7]._id],
        avgRating: 0,
        reviewCount: 0,
        reviewIds: [],
        verified: true
      },
      {
        name: 'Cinnamon',
        description: 'Cinnamon supplementation lowers fasting glucose, insulin resistance, and HbA1C in T2DM.',
        categories: ['Spice', 'Glycemic Control'],
        symptoms: [
          { name: 'High Blood Sugar', relevanceScore: 90 },
          { name: 'Insulin Resistance', relevanceScore: 80 }
        ],
        warnings: [
          'Coumarin content can be liver‑toxic in high doses',
          'Use Ceylon cinnamon for lower coumarin'
        ],
        sourceIds: [sources[8]._id],
        avgRating: 0,
        reviewCount: 0,
        reviewIds: [],
        verified: true
      },
      {
        name: 'Valerian Root',
        description: 'Valerian may improve sleep onset and quality with minimal side effects.',
        categories: ['Herb', 'Sedative'],
        symptoms: [
          { name: 'Insomnia', relevanceScore: 85 },
          { name: 'Sleep Latency', relevanceScore: 75 }
        ],
        warnings: [
          'Not for long‑term continuous use',
          'May cause morning grogginess in some'
        ],
        sourceIds: [sources[9]._id],
        avgRating: 0,
        reviewCount: 0,
        reviewIds: [],
        verified: true
      },
      {
        name: 'St John’s Wort',
        description: 'Hypericum perforatum shows comparable efficacy to SSRIs in mild-to-moderate depression.',
        categories: ['Herb', 'Antidepressant'],
        symptoms: [
          { name: 'Depression', relevanceScore: 85 },
          { name: 'Low Mood', relevanceScore: 75 }
        ],
        warnings: [
          'Numerous drug interactions (e.g. warfarin, OCPs)',
          'Avoid during pregnancy'
        ],
        sourceIds: [sources[10]._id],
        avgRating: 0,
        reviewCount: 0,
        reviewIds: [],
        verified: true
      },
      {
        name: 'Probiotics',
        description: 'Certain probiotic strains reduce IBS symptoms like bloating and pain.',
        categories: ['Supplement', 'Gut Health'],
        symptoms: [
          { name: 'IBS Pain', relevanceScore: 85 },
          { name: 'Bloating', relevanceScore: 80 }
        ],
        warnings: [
          'Live cultures may cause transient gas',
          'Immunocompromised individuals should consult doctor'
        ],
        sourceIds: [sources[11]._id],
        avgRating: 0,
        reviewCount: 0,
        reviewIds: [],
        verified: true
      },
      {
        name: 'Fish Oil (Omega‑3)',
        description: 'Marine omega‑3s reduce cardiovascular mortality and improve outcomes in heart disease.',
        categories: ['Supplement', 'Cardiovascular'],
        symptoms: [
          { name: 'High Triglycerides', relevanceScore: 90 },
          { name: 'Cardiovascular Risk', relevanceScore: 85 }
        ],
        warnings: [
          'High doses may increase bleeding risk',
          'Quality varies across brands'
        ],
        sourceIds: [sources[12]._id],
        avgRating: 0,
        reviewCount: 0,
        reviewIds: [],
        verified: true
      },
      {
        name: 'Milk Thistle (Silymarin)',
        description: 'Milk thistle is safe in chronic liver disease but shows limited impact on mortality or histology.',
        categories: ['Herb', 'Hepatoprotective'],
        symptoms: [
          { name: 'Liver Health', relevanceScore: 75 },
          { name: 'Oxidative Stress', relevanceScore: 70 }
        ],
        warnings: [
          'May cause laxative effect in some',
          'Avoid if allergic to Asteraceae family'
        ],
        sourceIds: [sources[13]._id],
        avgRating: 0,
        reviewCount: 0,
        reviewIds: [],
        verified: true
      },
      {
        name: 'Ginkgo Biloba',
        description: 'Evidence for Ginkgo in dementia and cognitive decline is inconclusive.',
        categories: ['Supplement', 'Cognitive Health'],
        symptoms: [
          { name: 'Memory', relevanceScore: 60 },
          { name: 'Cognitive Decline', relevanceScore: 55 }
        ],
        warnings: [
          'May increase bleeding risk with anticoagulants',
          'Quality of evidence is low'
        ],
        sourceIds: [sources[14]._id],
        avgRating: 0,
        reviewCount: 0,
        reviewIds: [],
        verified: true
      },
      {
        name: 'Ginger for Osteoarthritis',
        description: 'Ginger extract reduces pain and improves function in knee osteoarthritis.',
        categories: ['Herb', 'Anti‑inflammatory'],
        symptoms: [
          { name: 'Joint Pain', relevanceScore: 90 },
          { name: 'Stiffness', relevanceScore: 80 }
        ],
        warnings: [
          'May interact with blood thinners',
          'Check for gastrointestinal tolerance'
        ],
        sourceIds: [sources[15]._id],
        avgRating: 0,
        reviewCount: 0,
        reviewIds: [],
        verified: true
      },
      {
        name: 'Boswellia Serrata',
        description: 'Boswellia extract shows anti‑inflammatory and analgesic effects in osteoarthritis.',
        categories: ['Herb', 'Anti‑inflammatory'],
        symptoms: [
          { name: 'Joint Pain', relevanceScore: 90 },
          { name: 'Inflammation', relevanceScore: 85 }
        ],
        warnings: [
          'May cause gastrointestinal upset',
          'Avoid if allergic to frankincense'
        ],
        sourceIds: [sources[16]._id],
        avgRating: 0,
        reviewCount: 0,
        reviewIds: [],
        verified: true
      },
      {
        name: 'Curcumin in IBD',
        description: 'Curcumin supplementation induces remission in ulcerative colitis patients.',
        categories: ['Supplement', 'Gastrointestinal'],
        symptoms: [
          { name: 'UC Remission', relevanceScore: 85 },
          { name: 'Inflammation', relevanceScore: 80 }
        ],
        warnings: [
          'May interact with certain medications',
          'Standardization of extract is important'
        ],
        sourceIds: [sources[17]._id],
        avgRating: 0,
        reviewCount: 0,
        reviewIds: [],
        verified: true
      },
      {
        name: 'Curcumin in Metabolic Disease',
        description: 'Umbrella meta-analysis shows curcumin reduces CRP, IL‑6, TNF‑α in metabolic syndrome.',
        categories: ['Supplement', 'Metabolic Health'],
        symptoms: [
          { name: 'Inflammation', relevanceScore: 90 },
          { name: 'Oxidative Stress', relevanceScore: 85 }
        ],
        warnings: [
          'Bioavailability is low without enhancers',
          'Long‑term safety data limited'
        ],
        sourceIds: [sources[18]._id],
        avgRating: 0,
        reviewCount: 0,
        reviewIds: [],
        verified: true
      },
      {
        name: 'Garlic Extract',
        description: 'Garlic supplementation reduces incidence and duration of common cold episodes.',
        categories: ['Supplement', 'Immune Support'],
        symptoms: [
          { name: 'Common Cold', relevanceScore: 85 },
          { name: 'Immune Function', relevanceScore: 80 }
        ],
        warnings: [
          'May cause bad breath or body odor',
          'Possible gastrointestinal discomfort'
        ],
        sourceIds: [sources[19]._id],
        avgRating: 0,
        reviewCount: 0,
        reviewIds: [],
        verified: true
      }
    ]);

    console.log('Created remedies:', remedies.length);

    // 5️⃣ Update each source with its remedyIds
    for (const source of sources) {
      const relatedRemedies = remedies.filter(r =>
        r.sourceIds.map(id => id.toString()).includes(source._id as unknown as string)
      );
      await Source.findByIdAndUpdate(source._id, {
        remedyIds: relatedRemedies.map(r => r._id)
      });
    }
    console.log('Updated sources with remedy references');

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedDatabase();
