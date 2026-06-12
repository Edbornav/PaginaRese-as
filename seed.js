const API_URL = process.env.API_URL || 'http://localhost:5000/api';

const users = [
  { email: 'demo@demo.com', password: 'Demo1234', username: 'DemoAdmin' },
  { email: 'user@test.com', password: 'User1234', username: 'TestUser' }
];

const catalogItems = [
  { title: 'The Legend of Zelda: Tears of the Kingdom', category: 'videogame', coverImageUrl: 'https://res.cloudinary.com/dfcbsqxfq/image/upload/v1/seed/zelda_totk', releaseDate: '2023-05-12', creator: 'Nintendo', description: 'Secuela de Breath of the Wild. Link explora los cielos y las profundidades de Hyrule.' },
  { title: 'Inception', category: 'movie', coverImageUrl: 'https://res.cloudinary.com/dfcbsqxfq/image/upload/v1/seed/inception', releaseDate: '2010-07-16', creator: 'Christopher Nolan', description: 'Un ladrón especializado en extraer secretos del subconsciente a través de los sueños.' },
  { title: 'Breaking Bad', category: 'series', coverImageUrl: 'https://res.cloudinary.com/dfcbsqxfq/image/upload/v1/seed/breaking_bad', releaseDate: '2008-01-20', creator: 'Vince Gilligan', description: 'Un profesor de química se convierte en fabricante de metanfetaminas tras ser diagnosticado con cáncer.' },
  { title: 'Attack on Titan', category: 'anime', coverImageUrl: 'https://res.cloudinary.com/dfcbsqxfq/image/upload/v1/seed/aot', releaseDate: '2013-04-07', creator: 'Hajime Isayama', description: 'La humanidad lucha por sobrevivir dentro de murallas gigantes mientras titanes devoran a la gente.' },
  { title: 'Abbey Road', category: 'music', coverImageUrl: 'https://res.cloudinary.com/dfcbsqxfq/image/upload/v1/seed/abbey_road', releaseDate: '1969-09-26', creator: 'The Beatles', description: 'El icónico álbum de The Beatles con su famosa portada en el paso de cebra.' }
];

const reviews = [
  { itemIndex: 0, comment: 'Una obra maestra absoluta. La exploración vertical es increíble.', rating: 10 },
  { itemIndex: 0, comment: 'Mejor que Breath of the Wild en muchos aspectos.', rating: 9 },
  { itemIndex: 1, comment: 'Una película que te hace pensar. Nolan en su mejor momento.', rating: 10 }
];

async function registerUser(user) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
  const data = await res.json();
  if (!res.ok) {
    if (data.error && data.error.includes('Email already registered')) {
      console.log(`  Usuario ${user.email} ya existe`);
      return null;
    }
    throw new Error(data.error || 'Error al registrar');
  }
  return data.token;
}

async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');
  return data.token;
}

function parseToken(token) {
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  return {
    id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
    email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
    username: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
    role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
  };
}

async function seed() {
  console.log('=== SEED: Entertainment Reviews ===\n');

  console.log('1. Registrando usuarios...');
  const tokens = [];
  for (const user of users) {
    const token = await registerUser(user);
    if (token) tokens.push({ user, token });
    else {
      const t = await loginUser(user.email, user.password);
      tokens.push({ user, token: t });
    }
  }
  console.log(`  ${users.length} usuarios listos\n`);

  console.log('2. Promoviendo admin...');
  const adminToken = tokens[0].token;
  const adminUser = parseToken(adminToken);
  const { MongoClient } = require('mongodb');
  const uri = process.env.MONGO_URI || 'mongodb://admin:Demo1234@ac-31hzjo7-shard-00-00.qmlygn5.mongodb.net:27017,ac-31hzjo7-shard-00-01.qmlygn5.mongodb.net:27017,ac-31hzjo7-shard-00-02.qmlygn5.mongodb.net:27017/entertainment_reviews?ssl=true&replicaSet=atlas-tt803r-shard-0&authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('entertainment_reviews');
  await db.collection('users').updateOne(
    { _id: new (require('mongodb').ObjectId)(adminUser.id) },
    { $set: { role: 'admin' } }
  );
  console.log(`  ${adminUser.email} ahora es admin\n`);

  console.log('3. Insertando ítems de catálogo...');
  const cats = db.collection('catalog_items');
  await cats.deleteMany({});
  const inserted = await cats.insertMany(catalogItems.map(item => ({
    ...item,
    releaseDate: new Date(item.releaseDate),
    averageRating: 0,
    reviewCount: 0,
    createdAt: new Date()
  })));
  const catIds = Object.values(inserted.insertedIds);
  console.log(`  ${catIds.length} ítems insertados\n`);

  console.log('4. Insertando reseñas...');
  const userToken = tokens[1].token;
  const normalUser = parseToken(userToken);
  const revs = db.collection('reviews');
  await revs.deleteMany({});
  for (const rev of reviews) {
    await revs.insertOne({
      catalogItemId: new (require('mongodb').ObjectId)(catIds[rev.itemIndex]),
      userId: new (require('mongodb').ObjectId)(normalUser.id),
      username: normalUser.username,
      comment: rev.comment,
      rating: rev.rating,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  console.log(`  ${reviews.length} reseñas insertadas\n`);

  console.log('5. Actualizando promedios...');
  for (let i = 0; i < catIds.length; i++) {
    const stats = await revs.aggregate([
      { $match: { catalogItemId: new (require('mongodb').ObjectId)(catIds[i]) } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]).toArray();
    if (stats.length > 0) {
      await cats.updateOne(
        { _id: catIds[i] },
        { $set: { averageRating: Math.round(stats[0].avg * 2) / 2, reviewCount: stats[0].count } }
      );
    }
  }
  console.log('  Promedios actualizados\n');

  await client.close();
  console.log('=== SEED COMPLETADO ===');
}

seed().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
