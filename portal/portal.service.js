const PortalDAO = require('./portal.dao');
const Portal = require('./portal.model');
const Workflow = require('../workflow/workflow.model');
const Utils = require('../common/utils');

class PortalService {
    
    async getPortals(organizationId, filters) {
        return await PortalDAO.getPortalsByOrganization(organizationId, filters);
    }

    async getPortalById(portalId, organizationId) {
        try {
            const portal = await Portal.findOne({
                _id: portalId,
                organizationId,
                deletedAt: { $exists: false }
            }).populate('workflow', '_id');

            if (!portal) {
                throw new Error('Portal not found');
            }

            return {
                id: portal._id,
                name: portal.name,
                slug: portal.slug,
                description: portal.description,
                status: portal.status,
                workflowId: portal.workflow ? portal.workflow._id : null,
                createdAt: portal.createdAt,
                updatedAt: portal.updatedAt
            };
        } catch (error) {
            throw new Error(`Failed to get portal: ${error.message}`);
        }
    }

    async createPortal(portalData) {
        // Only validate workflow if workflowId is provided
        if (portalData.workflowId) {
            const workflow = await Workflow.findOne({
                _id: portalData.workflowId,
                organizationId: portalData.organizationId,
                deletedAt: { $exists: false }
            });

            if (!workflow) {
                throw new Error('Workflow not found or does not belong to your organization');
            }
        }

        // Generate unique slug
        const baseSlug = Utils.generateSlug(portalData.name);
        const uniqueSlug = await this.generateUniqueSlug(baseSlug, portalData.organizationId);

        // Create portal data
        const portal = {
            ...portalData,
            slug: uniqueSlug,
            status: 'draft'
        };

        // Only set workflow if workflowId is provided
        if (portalData.workflowId) {
            portal.workflow = portalData.workflowId;
        }

        return await PortalDAO.createPortal(portal);
    }

    async generateUniqueSlug(baseSlug, organizationId) {
        let slug = baseSlug;
        let counter = 1;
        
        while (await PortalDAO.slugExists(slug, organizationId)) {
            const randomSuffix = Utils.generateID(4);
            slug = `${baseSlug}-${randomSuffix.toLowerCase()}`;
            counter++;
            
            // Prevent infinite loop
            if (counter > 10) {
                slug = `${baseSlug}-${Date.now()}`;
                break;
            }
        }
        
        return slug;
    }

    async updatePortal(portalId, updateData, userId, organizationId) {
        try {
            // First, verify the portal exists and belongs to the organization
            const portal = await Portal.findOne({
                _id: portalId,
                organizationId,
                deletedAt: { $exists: false }
            });

            if (!portal) {
                throw new Error('Portal not found');
            }

            // Prepare update data
            const updateFields = {};
            
            // Only update fields that are provided and different from current values
            if (updateData.name !== undefined && updateData.name !== portal.name) {
                updateFields.name = updateData.name;
                
                // If name is changed, generate a new slug
                const baseSlug = Utils.generateSlug(updateData.name);
                const uniqueSlug = await this.generateUniqueSlug(baseSlug, organizationId);
                updateFields.slug = uniqueSlug;
            }

            if (updateData.description !== undefined) {
                updateFields.description = updateData.description;
            }

            if (updateData.status !== undefined && updateData.status !== portal.status) {
                updateFields.status = updateData.status;
                
                // If status is changed to active, set publishedAt timestamp
                if (updateData.status === 'active' && portal.status !== 'active') {
                    updateFields.publishedAt = new Date();
                }
            }

            // Always update these fields
            updateFields.updatedBy = userId;
            updateFields.updatedAt = new Date();

            // Update the portal
            const updatedPortal = await Portal.findByIdAndUpdate(
                portalId,
                updateFields,
                { new: true, runValidators: true }
            );

            if (!updatedPortal) {
                throw new Error('Failed to update portal');
            }

            return updatedPortal;
        } catch (error) {
            throw new Error(`Failed to update portal: ${error.message}`);
        }
    }
}

module.exports = new PortalService();