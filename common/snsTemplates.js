// SNS notification templates

class SNSTemplates {
    constructor() {}

    // Deal expired notification template
    dealExpired({
        dealId,
        dealTemplateId,
        brandId,
        branchId,
        expiredAt
    }) {
        const subject = `Deal Expired Notification`;
        const message = {
            event: 'DEAL_EXPIRED',
            dealId,
            dealTemplateId,
            brandId,
            branchId,
            expiredAt,
            message: `Deal with ID ${dealId} has expired at ${new Date(expiredAt).toISOString()}`
        };

        return {
            subject,
            message
        };
    }

    // Deal out of stock notification template
    dealOutOfStock({
        dealId,
        dealTemplateId,
        brandId,
        branchId,
        updatedAt
    }) {
        const subject = `Deal Out of Stock Notification`;
        const message = {
            event: 'DEAL_OUT_OF_STOCK',
            dealId,
            dealTemplateId,
            brandId,
            branchId,
            updatedAt,
            message: `Deal with ID ${dealId} has run out of available quantity at ${new Date(updatedAt).toISOString()}`
        };

        return {
            subject,
            message
        };
    }
}

module.exports = new SNSTemplates(); 