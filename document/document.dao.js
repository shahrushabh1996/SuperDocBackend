const Document = require('./document.model');

class DocumentDAO {
    
    async findDocumentById(id) {
        return await Document.findById(id);
    }

    async findDocumentByIdAndOrganization(id, organizationId) {
        return await Document.findOne({ 
            _id: id, 
            organizationId: organizationId 
        });
    }
}

module.exports = new DocumentDAO();