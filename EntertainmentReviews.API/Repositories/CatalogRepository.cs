using MongoDB.Driver;
using EntertainmentReviews.API.Models;
using EntertainmentReviews.API.Repositories.Interfaces;

namespace EntertainmentReviews.API.Repositories;

public class CatalogRepository : ICatalogRepository
{
    private readonly IMongoCollection<CatalogItem> _catalog;

    public CatalogRepository(IMongoDatabase database)
    {
        _catalog = database.GetCollection<CatalogItem>("catalog_items");
        var index = new CreateIndexModel<CatalogItem>(
            Builders<CatalogItem>.IndexKeys.Ascending(c => c.Category).Ascending(c => c.Title));
        _catalog.Indexes.CreateOne(index);
    }

    public async Task<List<CatalogItem>> GetAllAsync(string? category = null)
    {
        if (string.IsNullOrEmpty(category))
            return await _catalog.Find(_ => true).ToListAsync();

        var categories = category.Split(',');
        var filter = Builders<CatalogItem>.Filter.In(c => c.Category, categories);
        return await _catalog.Find(filter).ToListAsync();
    }

    public async Task<CatalogItem?> GetByIdAsync(string id) =>
        await _catalog.Find(c => c.Id == id).FirstOrDefaultAsync();

    public async Task CreateAsync(CatalogItem item) =>
        await _catalog.InsertOneAsync(item);

    public async Task UpdateAsync(string id, CatalogItem item) =>
        await _catalog.ReplaceOneAsync(c => c.Id == id, item);

    public async Task DeleteAsync(string id) =>
        await _catalog.DeleteOneAsync(c => c.Id == id);
}
