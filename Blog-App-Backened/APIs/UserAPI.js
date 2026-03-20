import exp from 'express'
import { register,authenticate } from '../services/authService.js'
import { verifyToken } from '../middlewares/verifyToken.js'
import cookieParser from 'cookie-parser'
import { ArticleModel } from '../models/ArticleModel.js'

export const userRoute = exp.Router()

//register user
userRoute.post('/users', async (req, res) => {
    //get user obj from req
    let userObj = req.body
    //call register
    const newUserObj = await register({ ...userObj, role: "USER" })
    //send res
    res.status(201).json({message:"user created",payload:newUserObj})
})


// read all articles (protected)
userRoute.get("/articles/:userId", verifyToken, async (req, res) => {
    // get all active articles
    let articles = await ArticleModel.find({ isArticleActive: true })
    // send res
    res.status(200).json({ message: "Articles fetched", payload: articles })
})


// add comment to an article (protected)
userRoute.post('/articles', verifyToken, async (req, res) => {
    // get data from req body
    let { articleId, comment } = req.body

    // check whether article is present
    let article = await ArticleModel.findById(articleId)
    if (!article || article.isArticleActive === false) {
        return res.status(404).json({ message: "Article not found" })
    }

    // add comment to article
    article.comments.push(comment)
    let updatedArticle = await article.save()

    // send res
    res.status(201).json({message: "Comment added",payload: updatedArticle})
})