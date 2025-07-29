const UserDAO = require('./user.dao');
const OrganizationDAO = require('../organization/organization.dao');
const utils = require('../common/utils');

class UserService {
    
    async signup(signupData) {
        const { organizationName, personName, mobile, email } = signupData;
        
        // Check if mobile number already exists
        const existingMobileUser = await UserDAO.findByMobile(mobile);
        if (existingMobileUser) {
            throw new Error('Mobile number already exists');
        }
        
        // Check if email already exists (if provided)
        if (email) {
            const existingEmailUser = await UserDAO.findByEmail(email);
            if (existingEmailUser) {
                throw new Error('Email already exists');
            }
        }
        
        // Generate 6-digit OTP - using fixed OTP for development
        const otp = process.env.NODE_ENV === 'production' ? utils.generateOtp(6) : '123456';
        
        // Set OTP expiry time to 5 minutes from now
        const otpExpireAt = new Date();
        otpExpireAt.setMinutes(otpExpireAt.getMinutes() + 5);
        
        // Create user data
        const userData = {
            fullName: personName,
            organizationName,
            personName,
            mobile,
            email,
            OTP: otp.toString(),
            OTPExpireAt: otpExpireAt,
            firstName: personName.split(' ')[0],
            lastName: personName.split(' ').slice(1).join(' ') || ''
        };
        
        // Create user first (without organizationId)
        const user = await UserDAO.createUser(userData);
        
        // Generate organization slug
        const slug = utils.generateSlug(organizationName);
        
        // Check if slug already exists, if so, append random string
        const existingOrg = await OrganizationDAO.findBySlug(slug);
        const finalSlug = existingOrg ? `${slug}-${utils.generateID(6)}` : slug;
        
        // Create organization
        const organizationData = {
            name: organizationName,
            slug: finalSlug,
            ownerId: user._id
        };
        
        const organization = await OrganizationDAO.createOrganization(organizationData);
        
        // Update user with organizationId
        await UserDAO.updateOrganizationId(user._id, organization._id);
        
        // Note: SMS integration would be implemented here
        console.log(`OTP for user ${mobile}: ${otp}`);
        
        return {
            message: 'Signup successful',
            userId: user._id,
            organizationId: organization._id,
            otp: otp // For testing purposes
        };
    }
    
    async sendOTP(mobile, isSignup = false) {
        const user = await UserDAO.findByMobile(mobile);
        
        // For signup flow, if user doesn't exist, just return success
        // The actual OTP will be sent during the signup process
        if (!user && isSignup) {
            return { 
                message: 'OTP will be sent during signup', 
                isNewUser: true 
            };
        }
        
        if (!user) {
            throw new Error('User not found');
        }
        
        // Generate 6-digit OTP - using fixed OTP for development
        const otp = process.env.NODE_ENV === 'production' ? utils.generateOtp(6) : '123456';
        
        // Set OTP expiry time to 5 minutes from now
        const otpExpireAt = new Date();
        otpExpireAt.setMinutes(otpExpireAt.getMinutes() + 5);
        
        // Update user with OTP and expiry time
        await UserDAO.updateOTP(user._id, otp.toString(), otpExpireAt);
        
        // Note: SMS integration would be implemented here
        // For now, we'll return the OTP for testing purposes
        console.log(`OTP for user ${mobile}: ${otp}`);
        
        return { message: 'OTP sent successfully', otp: otp };
    }
    
    async loginWithOTP(mobile, otp) {
        const user = await UserDAO.findByMobile(mobile);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        if (user.OTP !== otp) {
            throw new Error('Invalid OTP');
        }
        
        if (!user.OTPExpireAt || new Date() > user.OTPExpireAt) {
            throw new Error('OTP has expired');
        }
        
        // Clear OTP after successful verification
        await UserDAO.clearOTP(user._id);
        
        // Update last login
        await UserDAO.updateLastLogin(user._id);
        
        return user;
    }
}

module.exports = new UserService();