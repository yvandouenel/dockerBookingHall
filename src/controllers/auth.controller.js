import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';
import { validatePassword } from '../middleware/auth.js';

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
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const passwordIsValid = await bcrypt.compare(req.body.pwd, user.pwd);

        if (!passwordIsValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Vérifier si le mot de passe respecte les règles de sécurité
        const passwordCheck = validatePassword(req.body.pwd);
        const requiresPwdChange = !passwordCheck.isValid;

        const token = jwt.sign(
            { 
                uid: user.uid, 
                role: user.role,
                requiresPwdChange: requiresPwdChange 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        res.status(200).json({
            uid: user.uid,
            login: user.login,
            firstname: user.firstname,
            lastname: user.lastname,
            phone: user.phone,
            role: user.role,
            accessToken: token,
            requiresPwdChange: requiresPwdChange,
            passwordIssues: requiresPwdChange ? passwordCheck.reasons : null
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};  
export const getAllUsers = async (req, res) => {
    try {
        // Vérifier si l'utilisateur est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized - Admin access required" });
        }

        const users = await User.findAll({
            attributes: ['uid', 'login', 'firstname', 'lastname', 'phone', 'role']
        });

        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const user = await User.findOne({ where: { login: req.params.email } });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Vérifier les permissions
        if (req.user.role !== 'admin' && req.user.uid !== user.uid) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Seul un admin peut modifier le rôle
        if (req.body.role && req.user.role !== 'admin') {
            delete req.body.role;
        }

        let requiresPwdChange = false;

        // Si un nouveau mot de passe est fourni
        if (req.body.pwd) {
            if (req.user.role === 'admin') {
                // L'admin peut définir n'importe quel mot de passe
                // Mais l'utilisateur devra le changer
                requiresPwdChange = true;
                req.body.pwd = await bcrypt.hash(req.body.pwd, 10);
            } else {
                // Pour les utilisateurs normaux, vérifier les critères de sécurité
                const passwordCheck = validatePassword(req.body.pwd);
                
                if (!passwordCheck.isValid) {
                    return res.status(400).json({
                        message: "Password does not meet security requirements",
                        issues: passwordCheck.reasons
                    });
                }
                req.body.pwd = await bcrypt.hash(req.body.pwd, 10);
            }
        }

        await user.update(req.body);

        // Générer un nouveau token
        const token = jwt.sign(
            { 
                uid: user.uid, 
                role: user.role,
                requiresPwdChange: requiresPwdChange
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        res.json({
            message: "User updated successfully",
            user: {
                uid: user.uid,
                login: user.login,
                firstname: user.firstname,
                lastname: user.lastname,
                phone: user.phone,
                role: user.role
            },
            accessToken: token,
            requiresPwdChange: requiresPwdChange
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findOne({ where: { login: req.params.email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Vérifier les permissions
        if (req.user.role !== 'admin' && req.user.uid !== user.uid) {
            return res.status(403).json({ message: "Not authorized" });
        }
        await user.destroy();
        res.json({
            message: "User deleted successfully", user: {
                uid: user.uid,
                login: user.login,
                firstname: user.firstname,
                lastname: user.lastname,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};