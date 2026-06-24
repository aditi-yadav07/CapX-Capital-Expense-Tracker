const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token = req.headers.authorization;

    // Check karo ki token 'Bearer' se shuru ho raha hai ya nahi
    if (token && token.startsWith('Bearer')) {
        try {
            // Token nikalte hain (Bearer word ko hata kar)
            token = token.split(' ')[1];

            // Token ko verify karte hain secret key se
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // User ki ID ko request object me daal dete hain taki aage use ho sake
            req.user = decoded;
            next(); // Agle function par jao
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token galat hai!' });
        }
    } else {
        return res.status(401).json({ message: 'Koi token nahi mila, access denied!' });
    }
};

module.exports = { protect };