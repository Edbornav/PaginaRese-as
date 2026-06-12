// ============================================================
// SCRIPT MONGODB — Entertainment Reviews
// Correr en MongoDB Atlas Shell (mongosh) o en terminal
// ============================================================

// 1. MOSTRAR COLECCIONES
print('=== COLECCIONES ===');
db.getCollectionNames().forEach(c => print(' - ' + c));

// 2. CONTAR DOCUMENTOS
print('\n=== DOCUMENTOS POR COLECCIÓN ===');
print('users:           ' + db.users.countDocuments());
print('catalog_items:   ' + db.catalog_items.countDocuments());
print('reviews:         ' + db.reviews.countDocuments());
print('item_requests:   ' + db.item_requests.countDocuments());

// 3. MOSTRAR SCHEMA VALIDATION
print('\n=== SCHEMA VALIDATION ===');
db.getCollectionInfos({ name: 'users' }).forEach(c =>
  print('users validator:', JSON.stringify(c.options.validator, null, 2))
);
db.getCollectionInfos({ name: 'catalog_items' }).forEach(c =>
  print('catalog_items validator:', JSON.stringify(c.options.validator, null, 2))
);
db.getCollectionInfos({ name: 'reviews' }).forEach(c =>
  print('reviews validator:', JSON.stringify(c.options.validator, null, 2))
);
db.getCollectionInfos({ name: 'item_requests' }).forEach(c =>
  print('item_requests validator:', JSON.stringify(c.options.validator, null, 2))
);

// 4. MOSTRAR ÍNDICES
print('\n=== ÍNDICES ===');
db.users.getIndexes().forEach(i => printjson(i));
print('---');
db.catalog_items.getIndexes().forEach(i => printjson(i));
print('---');
db.reviews.getIndexes().forEach(i => printjson(i));
print('---');
db.item_requests.getIndexes().forEach(i => printjson(i));

// 5. MOSTRAR DATOS DE CADA COLECCIÓN (primeros documentos)
print('\n=== DATOS — users ===');
db.users.find().limit(2).forEach(doc => {
  doc.passwordHash = '(oculto)';
  printjson(doc);
});

print('\n=== DATOS — catalog_items (5 docs) ===');
db.catalog_items.find().limit(5).forEach(doc => printjson(doc));

print('\n=== DATOS — reviews (3 docs) ===');
db.reviews.find().limit(3).forEach(doc => printjson(doc));

// 6. PRUEBA DE SCHEMA VALIDATION (intentar insert inválido)
print('\n=== PRUEBA: insertar usuario sin email (debe RECHAZAR) ===');
try {
  db.users.insertOne({ passwordHash: 'abc', username: 'test', role: 'user' });
  print('  ERROR — debería haber rechazado');
} catch (e) {
  print('  RECHAZADO correctamente:', e.message);
}

// 7. PRUEBA DE RELACIÓN (referencia ObjectId)
print('\n=== RELACIÓN: referencia ObjectId ===');
print('Review -> catalogItemId referencia a CatalogItem._id');
print('Review -> userId referencia a User._id');
print('ItemRequest -> requestedBy referencia a User._id');

// 8. MOSTRAR UNA RESEÑA CON SU ITEM (populate manual)
print('\n=== EJEMPLO RELACIÓN: reseña con item ===');
const sampleReview = db.reviews.findOne();
if (sampleReview) {
  const item = db.catalog_items.findOne({ _id: sampleReview.catalogItemId });
  print('Reseña de:', item ? item.title : '(item no encontrado)');
  print('Rating:', sampleReview.rating);
  print('Comentario:', sampleReview.comment);
}

print('\n========================================');
print('SCRIPT COMPLETADO');
print('========================================');
