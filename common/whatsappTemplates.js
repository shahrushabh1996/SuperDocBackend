class WhatsappTemplates {
    constructor() {
    }
    
    // use logged in
    employeeLoggedIn() {
        return `We are notifying you that your account has been logged in. If you have any concerns or believe this activity is unauthorized, please contact support immediately.`;
    }
}

module.exports = new WhatsappTemplates();