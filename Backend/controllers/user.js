import User from "../models/user.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const signup = async (req, res) => {

    try {

        const { firstName, lastName, email, password, confirmPassword } = req.body;

        if (!firstName || !lastName || !email || !password || !confirmPassword) {

            return res.status(404).json({

                success: false,
                message: "All fields are required",
            });
        }

        if (password !== confirmPassword) {

            return res.status(404).json({

                success: false,
                message: "Passwords do not match",
            });
        }

        const userDetails = await User.findOne({ email: email });

        if (userDetails) {

            return res.status(401).json({

                success: false,
                message: "User already exists",
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const user = await User.create(
            {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: hashPassword,
                profileImage: `https://ui-avatars.com/api/?name=${firstName}+${lastName}`,
            }
        )

        return res.status(200).json({

            success: true,
            message: "User created successfully",
        });


    } catch (error) {

        console.log("Error in signing up", error.message);
        return res.status(500).json({

            success: false,
            message: 'Internal Server Error',
            error: error.message,
        })

    }
}

export const login = async (req, res) => { 

    try {

        const { email, password } = req.body;

        if (!email || !password) { 

            return res.status(404).json({

                success: false,
                message: "All fields are required",
            });
        }

        const emailExists = await User.findOne({ email: email });

        if (!emailExists) { 

            return res.status(404).json({

                success: false,
                message: "User not found",
            });
        }
 
        const passwordMatch = await bcrypt.compare(password, emailExists.password);

        if (!passwordMatch) { 

            return res.status(404).json({

                success: false,
                message: "Incorrect password!",
            });
        }

        const payload = {

            id: emailExists._id,
            email: emailExists.email,
            firstName: emailExists.firstName,
            lastName: emailExists.lastName,
            profileImage: emailExists.profileImage,
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '8h' });

        //create cookie and send response

        const options = {

            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        }

        res.cookie('token', token, options).status(200).json({

            success: true,
            message: "Logged in successfully",
            token: token,
            user : payload,
        });


    } catch (error) { 

        console.log("Error in logging in", error.message);
        return res.status(500).json({

            success: true,
            message: 'Internal Server Error',
            error: error.message,
        })
    }
}

export const logout = async(req,res) =>{

    try {
 
        res.clearCookie('token');
        res.status(200).json({
 
            success: true,
            message: "Logged out successfully",
        })

    } catch (error) { 

        console.log("Error in logging out", error.message);

        return res.status(500).json({
            success: false,
            message : 'Internal Server Error',
            error: error.message
        })
    }

}

export const fetchAllUsers = async (req, res) => { 

    try {

        const userId = req.user.id;
        const allUserDetails = await User.find({_id : {$ne : userId}}).select('-password');

        return res.status(200).json({

            success: true,
            message : "Users fetched successfully",
            users : allUserDetails
        })

    } catch (error) { 

        console.log("Error in fetching all users", error.message);
        return res.status(500).json({

            success: false,
            message: 'Internal Server Error',
            error: error.message,
        })
    }
}