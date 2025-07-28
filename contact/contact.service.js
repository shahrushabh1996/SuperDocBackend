const ContactDAO = require('./contact.dao');
const DocumentDAO = require('../document/document.dao');

class ContactService {
    
    async createContact(contactData, userId, organizationId) {
        const existingContact = await ContactDAO.findContactByEmail(contactData.email, organizationId);
        
        if (existingContact) {
            throw new Error('DUPLICATE_EMAIL');
        }

        const newContact = {
            ...contactData,
            userId: userId,
            organizationId: organizationId,
            createdBy: userId,
            updatedBy: userId,
            source: 'api'
        };

        return await ContactDAO.createContact(newContact);
    }

    async getContactById(id, organizationId) {
        const contact = await ContactDAO.findContactById(id);
        
        if (!contact || contact.organizationId.toString() !== organizationId) {
            throw new Error('CONTACT_NOT_FOUND');
        }

        return contact;
    }

    async getContactsByOrganization(organizationId, options) {
        return await ContactDAO.findContactsByOrganization(organizationId, options);
    }

    async updateContact(id, updateData, userId, organizationId) {
        const contact = await ContactDAO.findContactById(id);
        
        if (!contact || contact.organizationId.toString() !== organizationId) {
            throw new Error('CONTACT_NOT_FOUND');
        }

        if (updateData.email && updateData.email !== contact.email) {
            const existingContact = await ContactDAO.findContactByEmail(updateData.email, organizationId);
            if (existingContact && existingContact._id.toString() !== id) {
                throw new Error('DUPLICATE_EMAIL');
            }
        }

        const updatedContact = {
            ...updateData,
            updatedBy: userId
        };

        return await ContactDAO.updateContact(id, updatedContact);
    }

    async deleteContact(id, organizationId) {
        const contact = await ContactDAO.findContactById(id);
        
        if (!contact || contact.organizationId.toString() !== organizationId) {
            throw new Error('CONTACT_NOT_FOUND');
        }

        return await ContactDAO.deleteContact(id);
    }

    async updateContactStatus(id, action, userId, organizationId) {
        const contact = await ContactDAO.findContactById(id);
        
        if (!contact || contact.organizationId.toString() !== organizationId) {
            throw new Error('CONTACT_NOT_FOUND');
        }

        // Determine new status and message based on action
        let newStatus;
        let message;
        
        if (action === 'disable') {
            newStatus = 'DISABLED';
            message = 'Contact disabled successfully';
        } else if (action === 'enable') {
            newStatus = 'ENABLED';
            message = 'Contact enabled successfully';
        }

        const updateData = {
            status: newStatus,
            updatedBy: userId,
            updatedAt: new Date()
        };

        const updatedContact = await ContactDAO.updateContact(id, updateData);
        
        return {
            contact: updatedContact,
            message: message
        };
    }

    async shareDocumentWithContact(contactId, documentId, permissions, expiresAt, userId, organizationId) {
        // Verify contact exists and belongs to organization
        const contact = await ContactDAO.findContactById(contactId);
        if (!contact || contact.organizationId.toString() !== organizationId) {
            throw new Error('CONTACT_NOT_FOUND');
        }

        // Verify document exists and belongs to organization
        const document = await DocumentDAO.findDocumentByIdAndOrganization(documentId, organizationId);
        if (!document) {
            throw new Error('DOCUMENT_NOT_FOUND');
        }

        // Share document with contact
        const result = await ContactDAO.shareDocumentWithContact(contactId, documentId, permissions, expiresAt);
        
        if (!result) {
            throw new Error('SHARE_FAILED');
        }

        return result;
    }

    async getSharedDocuments(contactId, organizationId) {
        // Verify contact exists and belongs to organization
        const contact = await ContactDAO.findContactById(contactId);
        if (!contact || contact.organizationId.toString() !== organizationId) {
            throw new Error('CONTACT_NOT_FOUND');
        }

        return await ContactDAO.getSharedDocuments(contactId);
    }
}

module.exports = new ContactService();