const Contact = require('./contact.model');

class ContactDAO {
    
    async createContact(contactData) {
        const contact = new Contact(contactData);
        return await contact.save();
    }

    async findContactByEmail(email, organizationId) {
        return await Contact.findOne({ 
            email: email, 
            organizationId: organizationId,
            status: { $ne: 'DELETED' }
        });
    }

    async findContactById(id) {
        return await Contact.findOne({ 
            _id: id, 
            status: { $ne: 'DELETED' }
        });
    }

    async findContactsByOrganization(organizationId, options = {}) {
        const { page = 1, limit = 10, search = '', status, tags } = options;
        
        const query = { 
            organizationId: organizationId
        };

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) {
            query.status = status;
        } else {
            // If no status filter is provided, explicitly exclude DELETED contacts
            query.status = { $ne: 'DELETED' };
        }

        if (tags && tags.length > 0) {
            query.tags = { $in: tags };
        }

        const skip = (page - 1) * limit;
        
        const contacts = await Contact.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('firstName lastName email phone company status invitationDate tags lastInteractionAt createdAt notes')
            .lean();

        const total = await Contact.countDocuments(query);

        // Transform contacts to match the required response format
        const transformedContacts = contacts.map(contact => ({
            id: contact._id,
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email,
            phone: contact.phone || '',
            company: contact.company || '',
            status: contact.status,
            invitationDate: contact.invitationDate,
            tags: contact.tags || [],
            lastInteractionAt: contact.lastInteractionAt,
            createdAt: contact.createdAt,
            notes: contact.notes || ''
        }));

        return {
            contacts: transformedContacts,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        };
    }

    async updateContact(id, updateData) {
        return await Contact.findOneAndUpdate(
            { _id: id, status: { $ne: 'DELETED' } },
            { ...updateData, updatedAt: new Date() },
            { new: true }
        );
    }

    async deleteContact(id) {
        return await Contact.findOneAndUpdate(
            { _id: id, status: { $ne: 'DELETED' } },
            { 
                status: 'DELETED',
                deletedAt: new Date(),
                updatedAt: new Date()
            },
            { new: true }
        );
    }

    async shareDocumentWithContact(contactId, documentId, permissions, expiresAt) {
        const contact = await Contact.findById(contactId);
        if (!contact) {
            return null;
        }

        // Check if document is already shared with this contact
        const existingShareIndex = contact.sharedDocuments.findIndex(
            share => share.documentId.toString() === documentId
        );

        const shareData = {
            documentId: documentId,
            sharedAt: new Date(),
            permissions: permissions,
            expiresAt: expiresAt
        };

        if (existingShareIndex >= 0) {
            // Update existing share
            contact.sharedDocuments[existingShareIndex] = shareData;
        } else {
            // Add new share
            contact.sharedDocuments.push(shareData);
        }

        contact.updatedAt = new Date();
        return await contact.save();
    }

    async getSharedDocuments(contactId) {
        const contact = await Contact.findById(contactId)
            .populate('sharedDocuments.documentId', 'name description type mimeType size url');
        return contact ? contact.sharedDocuments : [];
    }
}

module.exports = new ContactDAO();