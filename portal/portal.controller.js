const portalService = require('./portal.service');
const portalValidation = require('./portal.validation');

class PortalController {
    constructor() {}

    async createPortal(req, res) {
        try {
            // Validate request data
            const { error, value } = await portalValidation.createPortal(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const { name, description, workflowId } = value;
            const { userId, organizationId } = req.user;

            // Create portal with the provided data
            const portalData = {
                name,
                description,
                userId,
                organizationId,
                createdBy: userId,
                updatedBy: userId
            };

            // Only add workflowId if it's provided
            if (workflowId) {
                portalData.workflowId = workflowId;
            }

            const portal = await portalService.createPortal(portalData);

            const responseData = {
                id: portal._id,
                name: portal.name,
                slug: portal.slug
            };

            // Only include workflowId if it exists
            if (portal.workflow) {
                responseData.workflowId = portal.workflow;
            }

            return res.status(201).json({
                success: true,
                data: responseData,
                message: 'Portal created successfully'
            });

        } catch (error) {
            console.error('Error creating portal:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getPortals(req, res) {
        try {
            const { organizationId } = req.user;
            const { page, limit, status } = req.query;
            
            const filters = {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                status
            };
            
            const result = await portalService.getPortals(organizationId, filters);
            
            const formattedPortals = result.portals.map(portal => ({
                id: portal._id,
                name: portal.name,
                slug: portal.slug,
                status: portal.status,
                workflowId: portal.workflow?._id || portal.workflow,
                createdAt: portal.createdAt
            }));
            
            return res.status(200).json({
                success: true,
                data: {
                    portals: formattedPortals,
                    pagination: result.pagination
                }
            });
            
        } catch (error) {
            console.error('Error fetching portals:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getPortalById(req, res) {
        try {
            const { id } = req.params;
            const { organizationId } = req.user;

            // Validate portal ID format
            if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid portal ID format'
                });
            }

            const portal = await portalService.getPortalById(id, organizationId);

            return res.status(200).json({
                success: true,
                data: portal
            });

        } catch (error) {
            console.error('Error getting portal:', error);
            if (error.message === 'Portal not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Portal not found'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async updatePortal(req, res) {
        try {
            const requestData = {
                id: req.params.id,
                ...req.body
            };

            const { error, value } = await portalValidation.updatePortal(requestData);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const userId = req.user.userId;
            const organizationId = req.user.organizationId;

            const { id, ...updateData } = value;
            const updatedPortal = await portalService.updatePortal(id, updateData, userId, organizationId);

            return res.status(200).json({
                success: true,
                message: 'Portal updated successfully',
                data: {
                    id: updatedPortal._id,
                    name: updatedPortal.name,
                    description: updatedPortal.description,
                    status: updatedPortal.status,
                    updatedAt: updatedPortal.updatedAt
                }
            });

        } catch (error) {
            console.error('Error updating portal:', error);
            if (error.message === 'Portal not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Portal not found'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

module.exports = new PortalController();