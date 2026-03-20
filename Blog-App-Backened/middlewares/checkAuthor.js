import { UserTypeModel } from '../models/UserModel.js'
export const checkAuthor = async (req, res, next) => {
    //get author id
    let aid = req.body?.author || req.params?.authorId
    //verify author
    let author = await UserTypeModel.findById(aid)
    //if author not found
    if (!author) {
        return res.status(401).json({message:"Invalid author"})
    }
    //if author found but role is different
    if (author.role !== 'AUTHOR') {
        return res.status(403).json({message:"User is not an author"})
    }
    //if author blocked
    if (!author.isActive) {
        return res.status(403).json({message:"Author account is not active"})
    }
    //forward req to next
    next()
}
