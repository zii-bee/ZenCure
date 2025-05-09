import { User, IUser } from '../../models';
import mongoose from 'mongoose';

describe('User Model', () => {
  let validUserData: Record<string, any>;

  beforeEach(() => {
    validUserData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };
  });

  it('should create a new user with valid data', async () => {
    const user = new User(validUserData);
    const savedUser = await user.save();
    
    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(validUserData.name);
    expect(savedUser.email).toBe(validUserData.email.toLowerCase());
    expect(savedUser.role).toBe('user'); // default role
    expect(savedUser.password).not.toBe(validUserData.password); // password should be hashed
  });

  it('should fail validation with missing required fields', async () => {
    const userWithoutEmail = new User({
      name: 'Test User',
      password: 'password123',
    });

    await expect(userWithoutEmail.save()).rejects.toThrow();
  });

  it('should fail validation with duplicate email', async () => {
    const user1 = new User(validUserData);
    await user1.save();

    const user2 = new User(validUserData);
    await expect(user2.save()).rejects.toThrow();
  });

  it('should correctly compare passwords', async () => {
    const user = new User(validUserData);
    await user.save();

    // Valid password
    const isValidPassword = await user.comparePassword('password123');
    expect(isValidPassword).toBe(true);

    // Invalid password
    const isInvalidPassword = await user.comparePassword('wrongpassword');
    expect(isInvalidPassword).toBe(false);
  });

  it('should not hash password if password is not modified', async () => {
    const user = new User(validUserData);
    await user.save();

    const originalPasswordHash = user.password;

    user.name = 'Updated Name';
    await user.save();

    expect(user.password).toBe(originalPasswordHash);
  });

  it('should handle health profile updates', async () => {
    const user = new User(validUserData);
    await user.save();

    user.healthProfile = {
      allergies: ['Peanuts', 'Penicillin'],
      conditions: ['Asthma'],
      preferences: ['No caffeine']
    };

    await user.save();
    const updatedUser = await User.findById(user._id);

    expect(updatedUser?.healthProfile?.allergies).toEqual(['Peanuts', 'Penicillin']);
    expect(updatedUser?.healthProfile?.conditions).toEqual(['Asthma']);
    expect(updatedUser?.healthProfile?.preferences).toEqual(['No caffeine']);
  });
});