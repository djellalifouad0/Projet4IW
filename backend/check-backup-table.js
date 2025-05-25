const sequelize = require('./config/db');

async function checkBackupTable() {
    try {
        console.log('🔍 Vérification des tables existantes...');
        
        // Lister toutes les tables
        const [tables] = await sequelize.query(`
            SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
        `);
        
        console.log('📋 Tables dans la base de données:');
        tables.forEach(table => {
            console.log(`- ${table.name}`);
        });

        // Vérifier spécifiquement la table Users_backup
        const [backupExists] = await sequelize.query(`
            SELECT name FROM sqlite_master WHERE type='table' AND name='Users_backup';
        `);
        
        if (backupExists.length > 0) {
            console.log('\n⚠️  Table Users_backup existe déjà!');
            
            // Compter les entrées dans Users_backup
            const [backupCount] = await sequelize.query('SELECT COUNT(*) as count FROM Users_backup');
            console.log(`Nombre d'entrées dans Users_backup: ${backupCount[0].count}`);
            
            // Voir le contenu de Users_backup
            const [backupContent] = await sequelize.query('SELECT id, username, email FROM Users_backup ORDER BY id');
            console.log('Contenu de Users_backup:');
            backupContent.forEach((user, index) => {
                console.log(`${index + 1}. ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
            });

            // Supprimer la table Users_backup pour permettre une synchronisation propre
            console.log('\n🗑️  Suppression de la table Users_backup...');
            await sequelize.query('DROP TABLE IF EXISTS Users_backup');
            console.log('✅ Table Users_backup supprimée');
        } else {
            console.log('\n✅ Aucune table Users_backup trouvée');
        }

        // Vérifier les contraintes de clés étrangères
        const [foreignKeys] = await sequelize.query(`
            SELECT sql FROM sqlite_master WHERE type='table' AND tbl_name != 'Users_backup' AND sql LIKE '%REFERENCES%Users%';
        `);
        
        if (foreignKeys.length > 0) {
            console.log('\n🔗 Tables avec références vers Users:');
            foreignKeys.forEach(fk => {
                console.log(fk.sql);
            });
        }

    } catch (error) {
        console.error('❌ Erreur lors de la vérification:', error.message);
    } finally {
        await sequelize.close();
    }
}

checkBackupTable();
