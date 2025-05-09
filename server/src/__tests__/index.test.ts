import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { mockRequest, mockResponse } from './helpers/mockReqRes';

dotenv.config();

// mock express and the modules it uses
jest.mock('express', () => {
  const mockApp = {
    get: jest.fn(),
    use: jest.fn(),
    set: jest.fn(),
    listen: jest.fn()
  };
  const mockExpress = jest.fn(() => mockApp);
  return Object.assign(mockExpress, {
    json: jest.fn(() => 'json-middleware')
  });
});

jest.mock('cors', () => jest.fn(() => 'cors-middleware'));
jest.mock('helmet', () => jest.fn(() => 'helmet-middleware'));
jest.mock('express-rate-limit', () => jest.fn(() => 'rate-limit-middleware'));
jest.mock('../routes', () => 'routes-module');

// mock mongoose connect
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(true)
}));

describe('Mock Request and Response', () => {
  it('should create mock objects', () => {
    const req = mockRequest();
    const res = mockResponse();
    expect(req).toBeDefined();
    expect(res).toBeDefined();
  });
});