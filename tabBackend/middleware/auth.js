import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith(`Bearer `)) {
        return res.status(401).json({error : `No token, Cannot be Authorized!`});
    }

    const token = authHeader.split(` `)[1];

    try {
        const secret = process.env.JWT_SECRET || 'tabflow_jwt_secret';
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: `Token Invalid! ${error.message}` });
    }

}
