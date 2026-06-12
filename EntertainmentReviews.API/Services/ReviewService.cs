using EntertainmentReviews.API.DTOs.Review;
using EntertainmentReviews.API.Models;
using EntertainmentReviews.API.Repositories.Interfaces;
using EntertainmentReviews.API.Services.Interfaces;

namespace EntertainmentReviews.API.Services;

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _reviewRepo;
    private readonly ICatalogRepository _catalogRepo;

    public ReviewService(IReviewRepository reviewRepo, ICatalogRepository catalogRepo)
    {
        _reviewRepo = reviewRepo;
        _catalogRepo = catalogRepo;
    }

    public async Task<List<ReviewDto>> GetByCatalogItemIdAsync(string catalogItemId)
    {
        var reviews = await _reviewRepo.GetByCatalogItemIdAsync(catalogItemId);
        return reviews.Select(MapToDto).ToList();
    }

    public async Task<ReviewDto> CreateAsync(string catalogItemId, string userId, string username, CreateReviewDto dto)
    {
        var existing = await _reviewRepo.GetByUserAndItemAsync(userId, catalogItemId);
        if (existing != null)
            throw new Exception("You already reviewed this item");

        var review = new Review
        {
            CatalogItemId = catalogItemId,
            UserId = userId,
            Username = username,
            Comment = dto.Comment,
            Rating = dto.Rating
        };

        await _reviewRepo.CreateAsync(review);
        await UpdateCatalogStats(catalogItemId);

        return MapToDto(review);
    }

    public async Task<List<ReviewDto>> GetByUserIdAsync(string userId)
    {
        var reviews = await _reviewRepo.GetByUserIdAsync(userId);
        var catalogIds = reviews.Select(r => r.CatalogItemId).Distinct().ToList();
        var items = await Task.WhenAll(catalogIds.Select(id => _catalogRepo.GetByIdAsync(id)));
        var itemMap = items.Where(i => i != null).ToDictionary(i => i!.Id, i => i!.Title);

        return reviews.Select(r =>
        {
            var dto = MapToDto(r);
            dto.ItemTitle = itemMap.GetValueOrDefault(r.CatalogItemId, "Unknown");
            return dto;
        }).ToList();
    }

    public async Task<ReviewDto?> UpdateAsync(string id, string userId, CreateReviewDto dto)
    {
        var review = await _reviewRepo.GetByIdAsync(id);
        if (review == null || review.UserId != userId)
            return null;

        review.Comment = dto.Comment;
        review.Rating = dto.Rating;
        review.UpdatedAt = DateTime.UtcNow;

        await _reviewRepo.UpdateAsync(id, review);
        await UpdateCatalogStats(review.CatalogItemId);

        return MapToDto(review);
    }

    public async Task<bool> DeleteAsync(string id, string userId, string? role = null)
    {
        var review = await _reviewRepo.GetByIdAsync(id);
        if (review == null) return false;
        if (review.UserId != userId && role != "admin") return false;

        await _reviewRepo.DeleteAsync(id);
        await UpdateCatalogStats(review.CatalogItemId);
        return true;
    }

    private async Task UpdateCatalogStats(string catalogItemId)
    {
        var reviews = await _reviewRepo.GetByCatalogItemIdAsync(catalogItemId);
        var item = await _catalogRepo.GetByIdAsync(catalogItemId);
        if (item == null) return;

        item.ReviewCount = reviews.Count;
        item.AverageRating = reviews.Count > 0 ? reviews.Average(r => r.Rating) : 0;
        await _catalogRepo.UpdateAsync(catalogItemId, item);
    }

    private static ReviewDto MapToDto(Review review) => new()
    {
        Id = review.Id,
        CatalogItemId = review.CatalogItemId,
        UserId = review.UserId,
        Username = review.Username,
        Comment = review.Comment,
        Rating = review.Rating,
        CreatedAt = review.CreatedAt,
        UpdatedAt = review.UpdatedAt
    };
}
