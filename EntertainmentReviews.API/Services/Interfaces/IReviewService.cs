using EntertainmentReviews.API.DTOs.Review;

namespace EntertainmentReviews.API.Services.Interfaces;

public interface IReviewService
{
    Task<List<ReviewDto>> GetByCatalogItemIdAsync(string catalogItemId);
    Task<List<ReviewDto>> GetByUserIdAsync(string userId);
    Task<ReviewDto> CreateAsync(string catalogItemId, string userId, string username, CreateReviewDto dto);
    Task<ReviewDto?> UpdateAsync(string id, string userId, CreateReviewDto dto);
    Task<bool> DeleteAsync(string id, string userId, string? role = null);
}
