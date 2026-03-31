import exp from 'express'
import { UserTypeModel } from '../models/UserModel.js'
export const adminRoute = exp.Router()

//read all articles(optional)


//block user
adminRoute.put('/block/:id', async (req, res) => {
    let uid = req.params.id
    let user = await UserTypeModel.findById(uid)
    if (!user) {
        return res.json({message:"User not found"})
    }
    if (user.isActive==false) {
        return res.json({message:"User already blocked previously"})
    }
    let blockUser = await UserTypeModel.findByIdAndUpdate(uid, { $set: { isActive: false } })
    res.json({message:"User blocked"})
})


//unblock user
adminRoute.put('/unblock/:id', async (req, res) => {
    let uid = req.params.id
    let user = await UserTypeModel.findById(uid)
    if (!user) {
        return res.json({message:"User not found"})
    }
    if (user.isActive==true) {
        return res.json({message:"User already unblocked previously"})
    }
    let blockUser = await UserTypeModel.findByIdAndUpdate(uid, { $set: { isActive: true } })
    res.json({message:"User unblocked"})
})