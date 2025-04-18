import { Request, Response } from 'express';
import { Remedy, Source } from '../models';

// get all remedies with pagination
export const getRemedies = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const remedies = await Remedy.find({})
      .sort({ avgRating: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalRemedies = await Remedy.countDocuments();
    
    res.json({
      remedies,
      page,
      pages: Math.ceil(totalRemedies / limit),
      total: totalRemedies
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// get remedy by ID
export const getRemedyById = async (req: Request, res: Response) => {
  try {
    const remedy = await Remedy.findById(req.params.id);
    
    if (remedy) {
      res.json(remedy);
    } else {
      res.status(404).json({ message: 'remedy not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// search remedies by keywords/symptoms
export const searchRemedies = async (req: Request, res: Response) => {
  try {
    const { keywords } = req.body;
    
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({ message: 'keywords array required' });
    }
    
    // find remedies where symptoms match any of the keywords
    const remedies = await Remedy.find({
      'symptoms.name': { $in: keywords }
    }).sort({ 'avgRating': -1 });
    
    res.json(remedies);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Query remedies with the advanced algorithm
export const queryRemedies = async (req: Request, res: Response) => {
  try {
    const { keywords } = req.body;
    
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({ message: 'keywords array required' });
    }
    
    // find remedies matching the symptoms
    const matchingRemedies = await Remedy.find({
      'symptoms.name': { $in: keywords }
    }).populate('sourceIds');
    
    // calculate relevance scores
    const scoredRemedies = matchingRemedies.map(remedy => {
      // start with base score based on average rating
      let relevanceScore = remedy.avgRating * 10; // scale to 0-50
      
      // add points for each matching symptom
      remedy.symptoms.forEach(symptom => {
        if (keywords.includes(symptom.name)) {
          relevanceScore += symptom.relevanceScore / 10; // add 0-10 points per matching symptom
        }
      });
      
      // add points for source credibility
      const sources = remedy.sourceIds as unknown as Array<{credibilityScore: number}>;
      const avgCredibility = sources.reduce((sum, source) => sum + source.credibilityScore, 0) / sources.length;
      relevanceScore += avgCredibility * 2; // add 0-20 points for credibility
      
      // add points for recency (newer entries prioritized)
      const ageInDays = (Date.now() - new Date(remedy.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, 10 - (ageInDays / 30)); // newer items get up to 10 points
      relevanceScore += recencyScore;
      
      return {
        ...remedy.toObject(),
        calculatedRelevanceScore: relevanceScore
      };
    });
    
    // sort by relevance score (highest to lowest)
    scoredRemedies.sort((a, b) => b.calculatedRelevanceScore - a.calculatedRelevanceScore);
    
    res.json(scoredRemedies);
  } catch (error: any) {
    if (error.message === 'DatabaseConnectionError') {
      return res.status(503).json({ message: 'database connection error' });
    }
    res.status(500).json({ message: error.message });
  }
};