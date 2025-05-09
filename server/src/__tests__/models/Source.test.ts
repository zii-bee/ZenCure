import { Source } from '../../models';
import mongoose from 'mongoose';

describe('Source Model', () => {
  let validSourceData: Record<string, any>;

  beforeEach(() => {
    validSourceData = {
      title: 'Test Source',
      url: 'https://example.com/test-source',
      credibilityScore: 8,
      publicationDate: new Date(),
      authors: ['Test Author'],
      publisher: 'Test Publisher',
      isPeerReviewed: true
    };
  });

  it('should create a source with valid data', async () => {
    const source = new Source(validSourceData);
    const savedSource = await source.save();
    
    expect(savedSource._id).toBeDefined();
    expect(savedSource.title).toBe(validSourceData.title);
    expect(savedSource.url).toBe(validSourceData.url);
    expect(savedSource.credibilityScore).toBe(validSourceData.credibilityScore);
    expect(savedSource.isPeerReviewed).toBe(validSourceData.isPeerReviewed);
    expect(savedSource.remedyIds).toEqual([]); // default value
  });

  it('should fail validation with missing required fields', async () => {
    const sourceWithoutTitle = new Source({
      ...validSourceData,
      title: undefined
    });

    await expect(sourceWithoutTitle.save()).rejects.toThrow();
  });

  it('should update the updatedAt field on save', async () => {
    const source = new Source(validSourceData);
    const savedSource = await source.save();
    
    const originalUpdatedAt = savedSource.updatedAt;
    
    // Wait a bit before updating
    await new Promise(resolve => setTimeout(resolve, 100));
    
    savedSource.title = 'Updated Title';
    await savedSource.save();
    
    expect(savedSource.updatedAt).not.toEqual(originalUpdatedAt);
  });

  it('should validate credibilityScore range', async () => {
    // Test score below minimum (1)
    const sourceWithLowScore = new Source({
      ...validSourceData,
      credibilityScore: 0
    });
    await expect(sourceWithLowScore.save()).rejects.toThrow();

    // Test score above maximum (10)
    const sourceWithHighScore = new Source({
      ...validSourceData,
      credibilityScore: 11
    });
    await expect(sourceWithHighScore.save()).rejects.toThrow();
  });

  it('should handle optional fields correctly', async () => {
    // Create source without optional fields
    const minimalSourceData = {
      title: 'Minimal Source',
      url: 'https://example.com/minimal',
      credibilityScore: 7
    };
    
    const minimalSource = new Source(minimalSourceData);
    const savedMinimalSource = await minimalSource.save();
    
    expect(savedMinimalSource._id).toBeDefined();
    expect(savedMinimalSource.authors).toEqual([]); // default empty array
    expect(savedMinimalSource.publisher).toBeUndefined(); // optional field
    expect(savedMinimalSource.isPeerReviewed).toBe(false); // default value
  });
});