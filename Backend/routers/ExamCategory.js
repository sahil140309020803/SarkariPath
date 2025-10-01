import express from 'express'
import { addCategory, deleteCategory, getCategories } from '../controllers/CategoryController.js';

const categoryRouter = express.Router();

categoryRouter.post('/add-category', addCategory);
categoryRouter.get('/get-categories', getCategories);
categoryRouter.get('/delete-category/:categoryId', deleteCategory);

export default categoryRouter;