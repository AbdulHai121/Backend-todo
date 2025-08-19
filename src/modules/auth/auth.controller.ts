
import { Request, Response } from 'express';
import prisma from '../../config/db';
import bcrypt from 'bcryptjs';
import transporter from '../../config/mailer';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    const user = await prisma.user.create({
      data: { name, email, password: hashed, verificationToken: otp, otpExpiry },
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    await transporter.sendMail({
      to: email,
      subject: 'Verify Your Email',
      html: `<p>Hello ${name},</p><p>Please enter the code <b>${otp}</b> to verify your email. This OTP is valid for 10 minutes.</p>`,
    });

    res.status(201).json({ message: 'User registered. Verification OTP sent to email.', token, email });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user or send OTP email' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { otp, email } = req.body;
  if (!otp || !email) {
    return res.status(400).json({ error: 'Missing OTP or email' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(200).json({ message: 'Email already verified' });
    }
    if (user.verificationToken !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    if (user.otpExpiry && new Date() > user.otpExpiry) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null, otpExpiry: null },
    });

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify email' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user.isVerified) {
      return res.status(403).json({ error: 'Email not verified' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    res.status(200).json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to login' });
  }
};
