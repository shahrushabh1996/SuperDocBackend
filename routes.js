// Implement all the routes here

const express = require('express');
const router = express.Router();


const userRoutes = require('./user/user.route');
const contactRoutes = require('./contact/contact.route');
const documentRoutes = require('./document/document.route');
const settingsRoutes = require('./settings/settings.route');
const workflowRoutes = require('./workflow/workflow.route');
const portalRoutes = require('./portal/portal.route');



// User routes
router.use('/user', userRoutes);

// Contact routes
router.use('/contacts', contactRoutes);

// Document routes
router.use('/documents', documentRoutes);

// Settings routes
router.use('/settings', settingsRoutes);

// Workflow routes
router.use('/workflows', workflowRoutes);

// Portal routes
router.use('/portals', portalRoutes);

module.exports = router;