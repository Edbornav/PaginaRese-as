using EntertainmentReviews.API.DTOs.Catalog;

namespace EntertainmentReviews.API.Services.Interfaces;

public interface ICatalogService
{
    Task<List<CatalogItemDto>> GetAllAsync(string? category = null);
    Task<CatalogItemDto?> GetByIdAsync(string id);
    Task<CatalogItemDto> CreateAsync(CreateCatalogItemDto dto);
    Task<CatalogItemDto?> UpdateAsync(string id, CreateCatalogItemDto dto);
    Task<bool> DeleteAsync(string id);
}
