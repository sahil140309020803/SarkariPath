import express from 'express'
import { addCategory, deleteCategory, getCategories, editCategory } from '../controllers/CategoryController.js';

const categoryRouter = express.Router();

categoryRouter.post('/add-category', addCategory);
categoryRouter.get('/get-categories', getCategories);
categoryRouter.get('/delete-category/:categoryId', deleteCategory);
categoryRouter.put('/edit-category/:categoryId', editCategory);

export default categoryRouter;