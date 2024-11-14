import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authrizeUser = async (req, res, next) => { 

    try {
 
        const token = req.headers.authorization.replace('Bearer ', '')
            || req.cookies.token || req.body.token;
        
        if (!token) { 

            return res.status(401).json({

                success: false,
                message: 'Unauthorized Access of User Data',
            })
        }
        
        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        req.user = payload;
        next();


    } catch (error) { 

        console.log("Error in authorizing user", error.message);
        return res.status(401).json({
            success: false,
            message: 'Unauthorized Access of User Data',
        })

    }
}