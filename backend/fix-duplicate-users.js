const sequelize = require('./config/db');

async function checkAndFixDuplicates() {
    try {
        // Requête pour vérifier les doublons dans la table Users
        const [duplicates] = await sequelize.query(`
            SELECT id, username, email, COUNT(*) as count 
            FROM Users 
            GROUP BY id 
            HAVING COUNT(*) > 1
            ORDER BY id
        `);

        console.log('🔍 Vérification des doublons dans la table Users...');
        console.log('Doublons trouvés:', duplicates.length);
        
        if (duplicates.length > 0) {
            console.log('📋 Détails des doublons:');
            duplicates.forEach(dup => {
                console.log(`ID: ${dup.id}, Username: ${dup.username}, Email: ${dup.email}, Count: ${dup.count}`);
            });
        }

        // Vérifier tous les utilisateurs
        const [allUsers] = await sequelize.query('SELECT id, username, email, profileToken FROM Users ORDER BY id');
        console.log('\n📊 Tous les utilisateurs dans la base:');
        console.log(`Total: ${allUsers.length} utilisateurs`);
        
        allUsers.forEach((user, index) => {
            console.log(`${index + 1}. ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, ProfileToken: ${user.profileToken?.substring(0, 10)}...`);
        });

        // Vérifier s'il y a des IDs NULL
        const [nullIds] = await sequelize.query('SELECT * FROM Users WHERE id IS NULL');
        console.log(`\n⚠️  Utilisateurs avec ID NULL: ${nullIds.length}`);
        
        if (nullIds.length > 0) {
            console.log('Détails des utilisateurs avec ID NULL:');
            nullIds.forEach((user, index) => {
                console.log(`${index + 1}. Username: ${user.username}, Email: ${user.email}, ProfileToken: ${user.profileToken?.substring(0, 10)}...`);
            });

            // Supprimer les utilisateurs avec ID NULL
            console.log('\n🗑️  Suppression des utilisateurs avec ID NULL...');
            await sequelize.query('DELETE FROM Users WHERE id IS NULL');
            console.log('✅ Utilisateurs avec ID NULL supprimés');
        }

        // Recompter après nettoyage
        const [finalUsers] = await sequelize.query('SELECT COUNT(*) as count FROM Users');
        console.log(`\n✅ Total final d'utilisateurs: ${finalUsers[0].count}`);

    } catch (error) {
        console.error('❌ Erreur lors de la vérification:', error.message);
    } finally {
        await sequelize.close();
    }
}

checkAndFixDuplicates();
