import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';

const User = db.users;

export const signup = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.pwd, 10);
        const user = await User.create({
            ...req.body,
            pwd: hashedPassword
        });

        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const user = await User.findOne({ where: { login: req.body.login } });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const passwordIsValid = await bcrypt.compare(req.body.pwd, user.pwd);

        if (!passwordIsValid) {
            return res.status(401).json({ message: "Invalid Password!" });
        }

        const token = jwt.sign(
            { uid: user.uid, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        res.status(200).json({
            uid: user.uid,
            login: user.login,
            role: user.role,
            accessToken: token
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};