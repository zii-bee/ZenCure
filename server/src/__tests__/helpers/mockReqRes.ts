// src/__tests__/helpers/mockReqRes.ts

export function mockRequest(options: any = {}) {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    ...options
  };
}

export function mockResponse() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Mock Request and Response', () => {
  it('should create mock objects', () => {
    const req = mockRequest();
    const res = mockResponse();
    expect(req).toBeDefined();
    expect(res).toBeDefined();
  });
});