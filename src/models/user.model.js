export default (sequelize, DataTypes) => {
    const User = sequelize.define("user", {
        uid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        login: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        pwd: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('user', 'admin'),
            defaultValue: 'user'
        },
        firstname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING
        }
    });
    return User;
};