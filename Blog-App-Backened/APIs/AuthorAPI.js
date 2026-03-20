import exp from 'express'
import { register,authenticate } from '../services/authService.js'
import { UserTypeModel } from '../models/UserModel.js'
import { ArticleModel } from '../models/ArticleModel.js'
import { checkAuthor } from '../middlewares/checkAuthor.js'
import { verifyToken } from '../middlewares/verifyToken.js'
import cookieParser from 'cookie-parser'


export const authorRoute = exp.Router()

//register author(public)
authorRoute.post('/users', async (req, res) => {
    //get user obj from req
    let userObj = req.body
    //call register
    const newUserObj = await register({ ...userObj, role: "AUTHOR" })
    //send res
    res.status(201).json({message:"author created",payload:newUserObj})
})



//create article(protected)
authorRoute.post('/articles',verifyToken,checkAuthor, async (req, res) => {
    //get article from req
    let article=req.body
    //create article document
    let newArticleDoc = new ArticleModel(article)
    //save
    let createdArticleDoc = await newArticleDoc.save()
    //send res
    res.status(201).json({message:"Artcle created",payload:createdArticleDoc})
})

//read articles of author(protected)
authorRoute.get("/articles/:authorId",verifyToken,checkAuthor, async (req, res) => {
    //get author id
    let aid=req.params.authorId
    //read articles by this author which are active
    let articles = await ArticleModel.find({ author:aid,isArticleActive:true }).populate("author","firstName email")
    //send res
    res.status(200).json({message:"Articles",payload:articles})
})

//edit article(protected)
authorRoute.put('/articles',verifyToken,checkAuthor, async (req, res) => {
    //get modified article from req
    let {articleId,title,category,content,author} = req.body
    //find article
    let articleOfDB = await ArticleModel.findOne({_id:articleId,author:author})
    if (!articleOfDB) {
        return res.status(401).json({message:"Article not found"})
    }
    //update the article
    let updatedArticle = await ArticleModel.findByIdAndUpdate(articleId,{
        $set:{title,category,content},
    },{new:true})
    //send res
    res.status(200).json({message:"Artcle updated",payload:updatedArticle})
})

// delete (soft delete) article(protected)
authorRoute.delete("/articles/:articleId", checkAuthor, async (req, res) => {
    let aid = req.params.articleId

    let articleOfDB = await ArticleModel.findById(aid)
    if (!articleOfDB) {
        return res.status(404).json({ message: "Article not found" })
    }

    let updatedArticle = await ArticleModel.findByIdAndUpdate(
        aid,
        { $set: { isArticleActive: false } },
        { new: true }
    )

    res.status(200).json({message: "Article deleted",payload: updatedArticle})
})

