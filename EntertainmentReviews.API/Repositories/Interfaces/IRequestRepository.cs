using EntertainmentReviews.API.Models;

namespace EntertainmentReviews.API.Repositories.Interfaces;

public interface IRequestRepository
{
    Task<List<ItemRequest>> GetAllAsync(string? status = null);
    Task<ItemRequest?> GetByIdAsync(string id);
    Task CreateAsync(ItemRequest request);
    Task UpdateAsync(string id, ItemRequest request);
}
