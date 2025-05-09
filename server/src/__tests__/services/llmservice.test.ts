import { getRemedyFromLLM } from '../../services/llmservice';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.test
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

// Mock axios properly
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('LLM Service', () => {
  // Save original env vars
  let originalEnv: NodeJS.ProcessEnv;
  
  beforeEach(() => {
    // Save environment variables
    originalEnv = { ...process.env };
    
    // Make sure GEMINI_API_KEY is available
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not defined in environment variables');
      throw new Error('GEMINI_API_KEY is required for tests');
    }
    
    // Reset axios mocks between tests
    jest.resetAllMocks();
  });
  
  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });
  
  it('should call Gemini API with correct parameters', async () => {
    // Get the actual API key from environment for validation
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Mock successful response
    const mockResponse = {
      data: {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: 'Headache, Nausea, Dizziness'
                }
              ]
            }
          }
        ]
      }
    };
    
    // Set up the axios mock to return our mock response
    mockedAxios.post.mockResolvedValueOnce(mockResponse);
    
    // Call the service
    const keywords = ['headache', 'dizziness'];
    const result = await getRemedyFromLLM(keywords);
    
    // Verify axios was called with correct URL and data
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    
    // Check the API endpoint
    const endpoint = mockedAxios.post.mock.calls[0][0];
    expect(endpoint).toContain('models/gemini-2.0-flash:generateContent');
    expect(endpoint).toContain(`key=${apiKey}`);
    
    // Check the request data
    const requestData = mockedAxios.post.mock.calls[0][1] as {
      contents: Array<{ parts: Array<{ text: string }> }>;
    };
    expect(requestData.contents[0].parts[0].text).toContain(keywords.join(', '));
    
    // Check the headers
    const headers = mockedAxios.post.mock.calls[0][2] as { headers: { 'Content-Type': string } };
    expect(headers.headers['Content-Type']).toBe('application/json');
    
    // Check the result
    expect(result).toBe('Headache, Nausea, Dizziness');
  });
  
  it('should handle API errors gracefully', async () => {
    // Mock error response
    const errorMessage = 'API rate limit exceeded';
    const mockError = new Error(errorMessage);
    
    // Important: Use mockRejectedValueOnce for proper error simulation
    mockedAxios.post.mockRejectedValueOnce(mockError);
    
    // Call the service and expect it to throw
    const keywords = ['headache'];
    await expect(getRemedyFromLLM(keywords)).rejects.toThrow(errorMessage);
  });
  
  it('should handle empty or invalid API responses', async () => {
    // Mock response with completely empty data structure
    // This is important - we need to match the exact path the code follows
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        // No candidates property at all
      }
    });
    
    // Call the service
    const keywords = ['headache'];
    const result = await getRemedyFromLLM(keywords);
    
    // Should provide a default message
    expect(result).toBe('No response generated.');
  });
});