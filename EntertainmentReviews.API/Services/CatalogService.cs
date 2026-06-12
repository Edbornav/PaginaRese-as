using EntertainmentReviews.API.DTOs.Catalog;
using EntertainmentReviews.API.Models;
using EntertainmentReviews.API.Repositories.Interfaces;
using EntertainmentReviews.API.Services.Interfaces;

namespace EntertainmentReviews.API.Services;

public class CatalogService : ICatalogService
{
    private readonly ICatalogRepository _repo;

    public CatalogService(ICatalogRepository repo) => _repo = repo;

    public async Task<List<CatalogItemDto>> GetAllAsync(string? category = null)
    {
        var items = await _repo.GetAllAsync(category);
        return items.Select(MapToDto).ToList();
    }

    public async Task<CatalogItemDto?> GetByIdAsync(string id)
    {
        var item = await _repo.GetByIdAsync(id);
        return item == null ? null : MapToDto(item);
    }

    public async Task<CatalogItemDto> CreateAsync(CreateCatalogItemDto dto)
    {
        var item = new CatalogItem
        {
            Title = dto.Title,
            Category = dto.Category,
            CoverImageUrl = dto.CoverImageUrl,
            ReleaseDate = dto.ReleaseDate,
            Creator = dto.Creator,
            Description = dto.Description
        };
        await _repo.CreateAsync(item);
        return MapToDto(item);
    }

    public async Task<CatalogItemDto?> UpdateAsync(string id, CreateCatalogItemDto dto)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null) return null;

        existing.Title = dto.Title;
        existing.Category = dto.Category;
        existing.CoverImageUrl = dto.CoverImageUrl;
        existing.ReleaseDate = dto.ReleaseDate;
        existing.Creator = dto.Creator;
        existing.Description = dto.Description;

        await _repo.UpdateAsync(id, existing);
        return MapToDto(existing);
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null) return false;
        await _repo.DeleteAsync(id);
        return true;
    }

    private static CatalogItemDto MapToDto(CatalogItem item) => new()
    {
        Id = item.Id,
        Title = item.Title,
        Category = item.Category,
        CoverImageUrl = item.CoverImageUrl,
        ReleaseDate = item.ReleaseDate,
        Creator = item.Creator,
        Description = item.Description,
        AverageRating = item.AverageRating,
        ReviewCount = item.ReviewCount
    };
}
