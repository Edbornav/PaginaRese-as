// seed.js — Script de seed para MongoDB
// Ejecutar: node seed.js
// Requiere: npm install mongodb dotenv
// Asegúrate de que el backend .NET esté corriendo en http://localhost:5000

const { MongoClient } = require('mongodb');
require('dotenv').config();

const API_BASE = 'http://localhost:5000/api';
const uri = process.env.MONGODB_URI || 'mongodb://admin:Demo1234@ac-31hzjo7-shard-00-00.qmlygn5.mongodb.net:27017,ac-31hzjo7-shard-00-01.qmlygn5.mongodb.net:27017,ac-31hzjo7-shard-00-02.qmlygn5.mongodb.net:27017/entertainment_reviews?ssl=true&replicaSet=atlas-tt803r-shard-0&authSource=admin';
const client = new MongoClient(uri);

async function apiRegister(email, password, username) {
    const resp = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username })
    });
    if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Error al registrar');
    }
    return resp.json();
}

async function seed() {
    await client.connect();
    const db = client.db('entertainment_reviews');

    // Limpiar colecciones
    await db.collection('users').deleteMany({});
    await db.collection('catalog_items').deleteMany({});
    await db.collection('reviews').deleteMany({});
    await db.collection('item_requests').deleteMany({});
    console.log('Colecciones limpiadas');

    // Registrar usuarios a través del API .NET (BCrypt.Net compatible)
    console.log('Registrando usuarios...');
    const adminToken = await apiRegister('demo@demo.com', 'Demo1234', 'Admin Demo');
    const userToken = await apiRegister('user@test.com', 'User1234', 'Usuario Test');

    // Obtener IDs de los usuarios creados
    const admin = await db.collection('users').findOne({ email: 'demo@demo.com' });
    const user = await db.collection('users').findOne({ email: 'user@test.com' });

    // Promover admin
    await db.collection('users').updateOne(
        { _id: admin._id },
        { $set: { role: 'admin' } }
    );
    console.log('Usuarios creados (hashes BCrypt.Net compatibles)');

    // Ítems del catálogo
    const items = [
        {
            title: 'The Legend of Zelda: Tears of the Kingdom',
            category: 'videogame',
            coverImageUrl: 'https://placehold.co/300x400/1E1040/5EEAD4?text=Zelda+TOTK',
            releaseDate: new Date('2023-05-12'),
            creator: 'Nintendo',
            description: 'Secuela de Breath of the Wild. Link explora los cielos y las profundidades de Hyrule.',
            averageRating: 0,
            reviewCount: 0,
            createdAt: new Date()
        },
        {
            title: 'Inception',
            category: 'movie',
            coverImageUrl: 'https://placehold.co/300x400/1E1040/5EEAD4?text=Inception',
            releaseDate: new Date('2010-07-16'),
            creator: 'Christopher Nolan',
            description: 'Un ladrón especializado en extraer secretos del subconsciente a través de los sueños.',
            averageRating: 0,
            reviewCount: 0,
            createdAt: new Date()
        },
        {
            title: 'Breaking Bad',
            category: 'series',
            coverImageUrl: 'https://placehold.co/300x400/1E1040/5EEAD4?text=Breaking+Bad',
            releaseDate: new Date('2008-01-20'),
            creator: 'Vince Gilligan',
            description: 'Un profesor de química se convierte en fabricante de metanfetaminas tras ser diagnosticado con cáncer.',
            averageRating: 0,
            reviewCount: 0,
            createdAt: new Date()
        },
        {
            title: 'Attack on Titan',
            category: 'anime',
            coverImageUrl: 'https://placehold.co/300x400/1E1040/5EEAD4?text=AOT',
            releaseDate: new Date('2013-04-07'),
            creator: 'Hajime Isayama',
            description: 'La humanidad lucha por sobrevivir dentro de murallas gigantes mientras titanes devoran a la gente.',
            averageRating: 0,
            reviewCount: 0,
            createdAt: new Date()
        },
        {
            title: 'Abbey Road',
            category: 'music',
            coverImageUrl: 'https://placehold.co/300x400/1E1040/5EEAD4?text=Abbey+Road',
            releaseDate: new Date('1969-09-26'),
            creator: 'The Beatles',
            description: 'El icónico álbum de The Beatles con su famosa portada en el paso de cebra.',
            averageRating: 0,
            reviewCount: 0,
            createdAt: new Date()
        }
    ];

    const itemResults = await db.collection('catalog_items').insertMany(items);
    const itemIds = Object.values(itemResults.insertedIds);
    console.log('Ítems del catálogo creados');

    // Reseñas de ejemplo
    const reviews = [
        {
            catalogItemId: itemIds[0],
            userId: user._id,
            username: 'Usuario Test',
            comment: 'Una obra maestra absoluta. Nintendo ha superado todas las expectativas con este título.',
            rating: 10,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            catalogItemId: itemIds[2],
            userId: user._id,
            username: 'Usuario Test',
            comment: 'La mejor serie de la historia. Personajes increíbles y una narrativa perfecta.',
            rating: 10,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            catalogItemId: itemIds[3],
            userId: user._id,
            username: 'Usuario Test',
            comment: 'Animación espectacular y una historia que te mantiene al borde del asiento.',
            rating: 9,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    await db.collection('reviews').insertMany(reviews);
    console.log('Reseñas de ejemplo creadas');

    // Actualizar stats del catálogo
    for (const itemId of itemIds) {
        const itemReviews = await db.collection('reviews').find({ catalogItemId: itemId }).toArray();
        const count = itemReviews.length;
        const avg = count > 0 ? itemReviews.reduce((s, r) => s + r.rating, 0) / count : 0;
        await db.collection('catalog_items').updateOne(
            { _id: itemId },
            { $set: { reviewCount: count, averageRating: avg } }
        );
    }
    console.log('Estadísticas actualizadas');

    console.log('\n✅ Seed completado exitosamente');
    console.log('📧 Admin: demo@demo.com / Demo1234');
    console.log('📧 User:  user@test.com / User1234');

    await client.close();
}

seed().catch(err => {
    console.error('Error en seed:', err);
    process.exit(1);
});
