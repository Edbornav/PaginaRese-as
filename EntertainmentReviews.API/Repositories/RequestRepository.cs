using MongoDB.Driver;
using EntertainmentReviews.API.Models;
using EntertainmentReviews.API.Repositories.Interfaces;

namespace EntertainmentReviews.API.Repositories;

public class RequestRepository : IRequestRepository
{
    private readonly IMongoCollection<ItemRequest> _requests;

    public RequestRepository(IMongoDatabase database)
    {
        _requests = database.GetCollection<ItemRequest>("item_requests");
    }

    public async Task<List<ItemRequest>> GetAllAsync(string? status = null)
    {
        if (string.IsNullOrEmpty(status))
            return await _requests.Find(_ => true).ToListAsync();
        return await _requests.Find(r => r.Status == status).ToListAsync();
    }

    public async Task<ItemRequest?> GetByIdAsync(string id) =>
        await _requests.Find(r => r.Id == id).FirstOrDefaultAsync();

    public async Task CreateAsync(ItemRequest request) =>
        await _requests.InsertOneAsync(request);

    public async Task UpdateAsync(string id, ItemRequest request) =>
        await _requests.ReplaceOneAsync(r => r.Id == id, request);
}
