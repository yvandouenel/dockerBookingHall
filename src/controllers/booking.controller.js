import db from '../models/index.js';
import { Op } from 'sequelize';

const Booking = db.bookings;

export const createBooking = async (req, res) => {
    try {
        const booking = await Booking.create({
            ...req.body,
            uid: req.user.uid
        });
        res.status(201).json(booking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const getMonthlyBookings = async (req, res) => {
    const { year, month } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    try {
        const bookings = await Booking.findAll({
            where: {
                start_date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [{
                model: db.users,
                as: 'user',
                attributes: ['firstname', 'lastname', 'login', 'phone']
            }]
        });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getMonthlyBookingsPrivate = async (req, res) => {
    const { year, month } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    try {
        const bookings = await Booking.findAll({
            where: {
                [Op.or]: [
                    {
                        private: false
                    },
                    {
                        uid: req.user.uid
                    }
                ],
                start_date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [{
                model: db.users,
                as: 'user',
                attributes: ['firstname', 'lastname']
            }]
        });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateBooking = async (req, res) => {
    const { bid } = req.params;
    try {
        const booking = await Booking.findByPk(bid);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.uid !== req.user.uid && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized" });
        }

        await booking.update(req.body);
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const deleteBooking = async (req, res) => {
    const { bid } = req.params;
    try {
        const booking = await Booking.findByPk(bid);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Vérifier les permissions
        if (booking.uid !== req.user.uid && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized" });
        }

        await booking.destroy();
        res.json({
            message: "Booking deleted successfully", booking: {
                bid: booking.uid
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
