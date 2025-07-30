const mongoose = require('mongoose');
const Contact = require('../contact/contact.model');
const config = require('../common/config');

async function addUniqueIndex() {
    try {
        // Connect to MongoDB
        await mongoose.connect(config.mongodbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('Connected to MongoDB');
        
        // Drop existing indexes on email if any
        const indexes = await Contact.collection.getIndexes();
        for (const indexName in indexes) {
            if (indexes[indexName].email) {
                console.log(`Dropping existing index: ${indexName}`);
                await Contact.collection.dropIndex(indexName);
            }
        }
        
        // Create the new compound unique index
        console.log('Creating compound unique index on email and organizationId...');
        await Contact.collection.createIndex(
            { email: 1, organizationId: 1 },
            { 
                unique: true,
                partialFilterExpression: { status: { $ne: 'DELETED' } },
                name: 'email_organizationId_unique'
            }
        );
        
        console.log('Index created successfully!');
        
        // Verify the index was created
        const newIndexes = await Contact.collection.getIndexes();
        console.log('Current indexes:', Object.keys(newIndexes));
        
    } catch (error) {
        console.error('Error creating index:', error);
        
        if (error.code === 11000) {
            console.error('\nDuplicate emails found in the database!');
            console.error('Please clean up duplicate emails before running this migration.');
            
            // Find duplicates
            const duplicates = await Contact.aggregate([
                {
                    $match: { status: { $ne: 'DELETED' } }
                },
                {
                    $group: {
                        _id: {
                            email: '$email',
                            organizationId: '$organizationId'
                        },
                        count: { $sum: 1 },
                        ids: { $push: '$_id' }
                    }
                },
                {
                    $match: { count: { $gt: 1 } }
                }
            ]);
            
            console.log('\nDuplicate contacts found:');
            duplicates.forEach(dup => {
                console.log(`Email: ${dup._id.email}, Organization: ${dup._id.organizationId}, Count: ${dup.count}`);
                console.log(`IDs: ${dup.ids.join(', ')}`);
            });
        }
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the migration
addUniqueIndex();