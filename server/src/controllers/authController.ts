import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, IUser } from '../models';

// generate JWT token
const generateToken = (id: string | mongoose.Types.ObjectId): string => {
    return jwt.sign({ id: id.toString() }, process.env.JWT_SECRET as string, {
      expiresIn: '30d'
    });
  };

// register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    
    // check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'user already exists' });
    }
    
    // create new user
    const user = await User.create({
      email,
      password,
      name
    });
    
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id as unknown as string)
      });
    } else {
      res.status(400).json({ message: 'invalid user data' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // find user by email
    const user = await User.findOne({ email });
    
    // check if user exists and password is correct
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id as unknown as string)
      });
    } else {
      res.status(401).json({ message: 'invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// get current user profile
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'user not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      // update health profile if provided
      if (req.body.healthProfile) {
        user.healthProfile = {
          allergies: req.body.healthProfile.allergies || user.healthProfile?.allergies || [],
          conditions: req.body.healthProfile.conditions || user.healthProfile?.conditions || [],
          preferences: req.body.healthProfile.preferences || user.healthProfile?.preferences || []
        };
      }
      
      // update password if provided
      if (req.body.password) {
        user.password = req.body.password;
      }
      
      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        healthProfile: updatedUser.healthProfile,
        token: generateToken(updatedUser._id as unknown as string)
      });
    } else {
      res.status(404).json({ message: 'user not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};