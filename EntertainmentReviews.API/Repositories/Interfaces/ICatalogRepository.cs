using EntertainmentReviews.API.Models;

namespace EntertainmentReviews.API.Repositories.Interfaces;

public interface ICatalogRepository
{
    Task<List<CatalogItem>> GetAllAsync(string? category = null);
    Task<CatalogItem?> GetByIdAsync(string id);
    Task CreateAsync(CatalogItem item);
    Task UpdateAsync(string id, CatalogItem item);
    Task DeleteAsync(string id);
}
