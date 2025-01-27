export default (sequelize, DataTypes) => {
    const Booking = sequelize.define("booking", {
        bid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                isDate: true
            }
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                isDate: true,
                isAfterStart(value) {
                    if (value <= this.start_date) {
                        throw new Error('End date must be after start date');
                    }
                }
            }
        },
        private: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        paid: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    });

    return Booking;
};
