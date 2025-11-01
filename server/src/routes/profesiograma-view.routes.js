import express from 'express';
import profesiogramaViewController from '../controllers/profesiograma-view.controller.js';

const router = express.Router();

/**
 * @route GET /api/profesiograma/:id
 * @desc Get profesiograma data by ID (for viewing in browser)
 * @access Public (could be protected with auth)
 */
router.get('/:id', profesiogramaViewController.getProfesiogramaData);

/**
 * @route POST /api/profesiograma/:id/export-pdf
 * @desc Generate PDF from profesiograma view using Puppeteer
 * @access Public (could be protected with auth)
 */
router.post('/:id/export-pdf', profesiogramaViewController.exportPDF);

export default router;
