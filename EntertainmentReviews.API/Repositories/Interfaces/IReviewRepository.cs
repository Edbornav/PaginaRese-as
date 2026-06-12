using EntertainmentReviews.API.Models;

namespace EntertainmentReviews.API.Repositories.Interfaces;

public interface IReviewRepository
{
    Task<List<Review>> GetByCatalogItemIdAsync(string catalogItemId);
    Task<List<Review>> GetByUserIdAsync(string userId);
    Task<Review?> GetByIdAsync(string id);
    Task<Review?> GetByUserAndItemAsync(string userId, string catalogItemId);
    Task CreateAsync(Review review);
    Task UpdateAsync(string id, Review review);
    Task DeleteAsync(string id);
}
