const db = require('../config/db');

const Category = {
    // Saari categories nikalna (Taki frontend me dropdown me dikha sakein)
    getAll: async () => {
        const [rows] = await db.execute('SELECT * FROM Categories');
        return rows;
    }
};

module.exports = Category;