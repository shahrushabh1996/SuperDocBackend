const Organization = require('./organization.model');

class OrganizationDAO {
    
    // Create a new organization
    async createOrganization(organizationData) {
        try {
            const organization = new Organization(organizationData);
            return await organization.save();
        } catch (error) {
            throw error;
        }
    }

    // Find organization by slug
    async findBySlug(slug) {
        try {
            return await Organization.findOne({ slug });
        } catch (error) {
            throw error;
        }
    }

    // Find organization by ID
    async findById(organizationId) {
        try {
            return await Organization.findById(organizationId);
        } catch (error) {
            throw error;
        }
    }

    // Update organization
    async updateOrganization(organizationId, updateData) {
        try {
            return await Organization.findByIdAndUpdate(
                organizationId,
                updateData,
                { new: true }
            );
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new OrganizationDAO();