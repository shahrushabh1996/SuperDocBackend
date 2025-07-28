const mongoose = require('mongoose');
const Brand = require('../brand/brand.model');
const Branch = require('../branch/branch.model');

/**
 * Migration script to:
 * 1. Create 2dsphere indexes for Brand and Branch location fields
 * 2. Populate location fields for existing records that have lat/long in address
 */
async function migrateLocationFields() {
    try {
        console.log('Starting location fields migration...');

        // Create 2dsphere indexes
        console.log('Creating 2dsphere indexes...');
        await Brand.collection.createIndex({ location: '2dsphere' });
        await Branch.collection.createIndex({ location: '2dsphere' });
        console.log('Indexes created successfully.');

        // Migrate Brand location fields
        console.log('Migrating Brand location fields...');
        const brandsToUpdate = await Brand.find({
            'address.lat': { $exists: true, $ne: null },
            'address.long': { $exists: true, $ne: null },
            location: { $exists: false }
        });

        let brandUpdatedCount = 0;
        for (const brand of brandsToUpdate) {
            const { lat, long } = brand.address;
            if (lat && long) {
                await Brand.findByIdAndUpdate(brand._id, {
                    location: {
                        type: 'Point',
                        coordinates: [long, lat] // [longitude, latitude]
                    }
                });
                brandUpdatedCount++;
            }
        }
        console.log(`Updated ${brandUpdatedCount} brands with location data.`);

        // Migrate Branch location fields
        console.log('Migrating Branch location fields...');
        const branchesToUpdate = await Branch.find({
            'address.lat': { $exists: true, $ne: null },
            'address.long': { $exists: true, $ne: null },
            $or: [
                { location: { $exists: false } },
                { 'location.coordinates': { $exists: false } }
            ]
        });

        let branchUpdatedCount = 0;
        for (const branch of branchesToUpdate) {
            const { lat, long } = branch.address;
            if (lat && long) {
                await Branch.findByIdAndUpdate(branch._id, {
                    location: {
                        type: 'Point',
                        coordinates: [long, lat] // [longitude, latitude]
                    }
                });
                branchUpdatedCount++;
            }
        }
        console.log(`Updated ${branchUpdatedCount} branches with location data.`);

        console.log('Migration completed successfully!');
        console.log(`Total updated: ${brandUpdatedCount} brands, ${branchUpdatedCount} branches`);

    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
}

// Run migration if this file is executed directly
if (require.main === module) {
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log('Connected to MongoDB');
        return migrateLocationFields();
    }).then(() => {
        console.log('Migration script completed');
        process.exit(0);
    }).catch((error) => {
        console.error('Migration script failed:', error);
        process.exit(1);
    });
}

module.exports = migrateLocationFields; 