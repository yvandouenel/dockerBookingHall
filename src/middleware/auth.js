import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: "No token provided!" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized!" });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Require Admin Role!" });
    }
    next();
};
// Valider le format du mot de passe
export const validatePassword = (password) => {
    const minLength = 10;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
        isValid: password.length >= minLength && 
                hasUpperCase && 
                hasLowerCase && 
                hasNumbers && 
                hasSpecialChar,
        reasons: {
            length: password.length < minLength,
            upperCase: !hasUpperCase,
            lowerCase: !hasLowerCase,
            numbers: !hasNumbers,
            specialChar: !hasSpecialChar
        }
    };
};