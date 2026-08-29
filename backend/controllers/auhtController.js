import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator'
import mongoose from 'mongoose'
import crypto from 'crypto';

const User = require('../models/User');
const Theater = require('../models/theater');
const otp = require('../models/otp');

