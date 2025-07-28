const User = require('./user.model');

class UserDAO {
    
    // Create a new user
    async createUser(userData) {
        try {
            const user = new User(userData);
            return await user.save();
        } catch (error) {
            throw error;
        }
    }

    // Find user by mobile number
    async findByMobile(mobile) {
        return await User.findOne({ mobile });
    }

    // Find user by email
    async findByEmail(email) {
        try {
            return await User.findOne({ email });
        } catch (error) {
            throw error;
        }
    }

    // Find user by ID
    async findById(userId) {
        try {
            return await User.findById(userId);
        } catch (error) {
            throw error;
        }
    }

    async updateOTP(userId, otp, otpExpireAt) {
        return await User.findByIdAndUpdate(
            userId,
            { OTP: otp, OTPExpireAt: otpExpireAt },
            { new: true }
        );
    }

    async updateOrganizationId(userId, organizationId) {
        return await User.findByIdAndUpdate(
            userId,
            { organizationId: organizationId },
            { new: true }
        );
    }

    async clearOTP(userId) {
        return await User.findByIdAndUpdate(
            userId,
            { $unset: { OTP: 1, OTPExpireAt: 1 } },
            { new: true }
        );
    }

    async updateLastLogin(userId) {
        return await User.findByIdAndUpdate(
            userId,
            { lastLoginAt: new Date() },
            { new: true }
        );
    }
}

module.exports = new UserDAO();