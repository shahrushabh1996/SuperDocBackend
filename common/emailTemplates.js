// Implement all the email templates here

class EmailTemplates {
    constructor() {}

    // Brand created successfully
    brandCreated({
        brandName,
        activationCode
    }) {
        const subject = `Sugary Brand Account Activation -  ${brandName}`;
        const text = `Dear ${brandName}<br/><br/><strong>Welcome to Sugary !!!<br/><hr>Your ${brandName} Brand Activation Code is : ${activationCode}</strong><hr><br/><br/><strong> Thanks <br/> Sugary Team<br/> We love to serve you </strong>`;

        return {
            subject,
            text
        };
    }

    branchApproved({
        branchName,
        activationCode
    }) {
        const subject = `Sugary Branch Account Activation -  ${branchName}`;
        const text = `Dear ${branchName}<br/><br/><strong>Welcome to Sugary !!!<br/><hr>Your ${branchName} Branch Activation Code is : ${activationCode}</strong><hr><br/><br/><strong> Thanks <br/> Sugary Team<br/> We love to serve you </strong>`;
    }
}

// const emailTemplates = new EmailTemplates();
// const { subject, text } = emailTemplates.brandCreated({
//     brandName: 'Test Brand',
//     activationCode: '123456'
// });

// console.log(subject, text);

module.exports = new EmailTemplates();