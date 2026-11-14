
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;

        // Create the collections if they do not exist.
        for (const name of ['users', 'groups', 'schedules']) {
            const exists = await db
                .listCollections({ name })
                .hasNext();

            if (!exists) {
                await db.createCollection(name);
            }
        }

        // Migrate MySQL Users table.
        const passwordHash = await bcrypt.hash('password123', 12);

        await db.collection('users').updateOne(
            { mysqlId: 1 },
            {
                $set: {
                    mysqlId: 1,
                    firstName: 'John',
                    lastName: 'Doe',
                    login: 'johndoe',
                    passwordHash
                }
            },
            { upsert: true }
        );

        console.log('Users migrated');

        // Migrate Groups and GroupMembers.
        await db.collection('groups').updateOne(
            { mysqlId: 1 },
            {
                $set: {
                    mysqlId: 1,
                    groupName: 'Developers',
                    members: [1]
                }
            },
            { upsert: true }
        );

        console.log('Groups and memberships migrated');

        // The MySQL Schedules table currently has zero records.
        console.log('Schedules collection ready');

        // Create indexes to enforce unique MySQL IDs and logins.
        await db.collection('users').createIndex(
            { mysqlId: 1 },
            { unique: true }
        );

        await db.collection('users').createIndex(
            { login: 1 },
            { unique: true }
        );

        await db.collection('groups').createIndex(
            { mysqlId: 1 },
            { unique: true }
        );

        console.log('Indexes created');
        console.log('Migration completed successfully!');

    } catch (error) {
        console.error('Migration failed:', error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

migrate();
