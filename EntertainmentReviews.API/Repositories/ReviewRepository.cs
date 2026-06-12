using MongoDB.Driver;
using EntertainmentReviews.API.Models;
using EntertainmentReviews.API.Repositories.Interfaces;

namespace EntertainmentReviews.API.Repositories;

public class ReviewRepository : IReviewRepository
{
    private readonly IMongoCollection<Review> _reviews;

    public ReviewRepository(IMongoDatabase database)
    {
        _reviews = database.GetCollection<Review>("reviews");
        try
        {
            var index = new CreateIndexModel<Review>(
                Builders<Review>.IndexKeys.Ascending(r => r.CatalogItemId).Ascending(r => r.UserId),
                new CreateIndexOptions { Unique = true });
            _reviews.Indexes.CreateOne(index);
        }
        catch { }
    }

    public async Task<List<Review>> GetByCatalogItemIdAsync(string catalogItemId) =>
        await _reviews.Find(r => r.CatalogItemId == catalogItemId).ToListAsync();

    public async Task<List<Review>> GetByUserIdAsync(string userId) =>
        await _reviews.Find(r => r.UserId == userId).ToListAsync();

    public async Task<Review?> GetByIdAsync(string id) =>
        await _reviews.Find(r => r.Id == id).FirstOrDefaultAsync();

    public async Task<Review?> GetByUserAndItemAsync(string userId, string catalogItemId) =>
        await _reviews.Find(r => r.UserId == userId && r.CatalogItemId == catalogItemId).FirstOrDefaultAsync();

    public async Task CreateAsync(Review review) =>
        await _reviews.InsertOneAsync(review);

    public async Task UpdateAsync(string id, Review review) =>
        await _reviews.ReplaceOneAsync(r => r.Id == id, review);

    public async Task DeleteAsync(string id) =>
        await _reviews.DeleteOneAsync(r => r.Id == id);
}
