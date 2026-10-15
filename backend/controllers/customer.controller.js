import Customer from "../models/customer.model.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    const existingCustomer = await Customer.findOne({ email });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      fullName,
      email,
      password: hashedPassword,
      phone
    });
    return res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const loginCustomer = async (req, res) => {
    try{
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                success : false,
                message : "Email and password are requried"
            })
        }

        const customer = await Customer.findOne({email})

        if(!customer){
            return res.status(401).json({
                success : false,
                message : "Invalid Credentials"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password, customer.password)

        if(!isPasswordCorrect){
            return res.status(401).json({
                success : false,
                message : "Invalid Credentials"
            })
        }

        const token = jwt.sign(
            { id: customer._id},
            process.env.JWT_SECRET,
            {expiresIn : "1d"}
        )

        res.cookie("token", token, {
            httpOnly : true,
            secure: false,            
        })

        return res.status(200).json({
            success: true,
            message: "Login Successfull"
        })
    } catch(error){
        console.log(error)
        return res.status(500).json({
            success : false,
            message : "Internal Server Error"
        })
    }
};

export const getMyProfile = async (req, res) =>{
    try{
        return res.status(200).json(req.user)
    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : "Internal Server Error"
        })
    }
}

export const logoutCustomer = async (req, res) => {
    try{
        res.clearCookie("token" , {
            httpOnly : true,
            secure : false, 
            sameSite : "lax"
        })

        return res.status(200).json({
            success : true,
            message : "Logged Out Successfully"
        })
    }catch(error){
        return res.status(500).json({
            success : false,
            message : "Internal Server Error"
        })
    }
}

export const changePassword = async (req, res ) =>{
    try{
        const {oldPassword, newPassword}= req.body
        
        if(!oldPassword || !newPassword){
            res.status(400).json({
                success : false,
                message : "Old password and New password are requried"
            })
        }

        if(newPassword.length < 6){
            res.status(400).json({
                success : false,
                message : "New Password must be at least 6 characters long"
            })
        }

        const customer = await Customer.findById(req.user._id)

        if(!customer) {
            res.status(401).json({
                success : false,
                message : "Unauthorized"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(oldPassword, customer.password)

        if(!isPasswordCorrect){
            res.status(401).json({
                success : false,
                message: "Invalid Old Password"
            })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        customer.password = hashedPassword

        await customer.save()

        return res.status(200).json({
            success : true,
            message: "Password changed successfully"
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}