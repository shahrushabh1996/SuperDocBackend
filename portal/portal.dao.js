const Portal = require('./portal.model');

class PortalDAO {
    
    async getPortalsByOrganization(organizationId, filters = {}) {
        const { status, page = 1, limit = 10 } = filters;
        
        const query = {
            organizationId,
            deletedAt: { $exists: false }
        };
        
        if (status) {
            query.status = status;
        }
        
        const skip = (page - 1) * limit;
        
        const [portals, total] = await Promise.all([
            Portal.find(query)
                .select('name slug status workflow createdAt')
                .populate('workflow', '_id')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Portal.countDocuments(query)
        ]);
        
        return {
            portals,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        };
    }

    async createPortal(portalData) {
        const portal = new Portal(portalData);
        return await portal.save();
    }

    async slugExists(slug, organizationId) {
        const existingPortal = await Portal.findOne({
            slug,
            organizationId,
            deletedAt: { $exists: false }
        });
        return !!existingPortal;
    }
}

module.exports = new PortalDAO();