using EntertainmentReviews.API.DTOs.Request;
using EntertainmentReviews.API.Models;
using EntertainmentReviews.API.Repositories.Interfaces;
using EntertainmentReviews.API.Services.Interfaces;

namespace EntertainmentReviews.API.Services;

public class RequestService : IRequestService
{
    private readonly IRequestRepository _requestRepo;
    private readonly ICatalogRepository _catalogRepo;

    public RequestService(IRequestRepository requestRepo, ICatalogRepository catalogRepo)
    {
        _requestRepo = requestRepo;
        _catalogRepo = catalogRepo;
    }

    public async Task<List<ItemRequestDto>> GetAllAsync(string? status = null)
    {
        var requests = await _requestRepo.GetAllAsync(status);
        return requests.Select(MapToDto).ToList();
    }

    public async Task<ItemRequestDto> CreateAsync(string userId, CreateItemRequestDto dto)
    {
        var request = new ItemRequest
        {
            RequestedBy = userId,
            Title = dto.Title,
            Category = dto.Category,
            CoverImageUrl = dto.CoverImageUrl,
            ReleaseDate = dto.ReleaseDate,
            Creator = dto.Creator,
            Description = dto.Description
        };

        await _requestRepo.CreateAsync(request);
        return MapToDto(request);
    }

    public async Task<ItemRequestDto?> ApproveAsync(string id, string adminId)
    {
        var request = await _requestRepo.GetByIdAsync(id);
        if (request == null || request.Status != "pending") return null;

        request.Status = "approved";
        request.ReviewedBy = adminId;
        request.ReviewedAt = DateTime.UtcNow;
        await _requestRepo.UpdateAsync(id, request);

        var catalogItem = new CatalogItem
        {
            Title = request.Title,
            Category = request.Category,
            CoverImageUrl = request.CoverImageUrl,
            ReleaseDate = request.ReleaseDate,
            Creator = request.Creator,
            Description = request.Description
        };
        await _catalogRepo.CreateAsync(catalogItem);

        return MapToDto(request);
    }

    public async Task<ItemRequestDto?> RejectAsync(string id, string adminId)
    {
        var request = await _requestRepo.GetByIdAsync(id);
        if (request == null || request.Status != "pending") return null;

        request.Status = "rejected";
        request.ReviewedBy = adminId;
        request.ReviewedAt = DateTime.UtcNow;
        await _requestRepo.UpdateAsync(id, request);

        return MapToDto(request);
    }

    private static ItemRequestDto MapToDto(ItemRequest request) => new()
    {
        Id = request.Id,
        RequestedBy = request.RequestedBy,
        Title = request.Title,
        Category = request.Category,
        CoverImageUrl = request.CoverImageUrl,
        ReleaseDate = request.ReleaseDate,
        Creator = request.Creator,
        Description = request.Description,
        Status = request.Status,
        ReviewedBy = request.ReviewedBy,
        CreatedAt = request.CreatedAt,
        ReviewedAt = request.ReviewedAt
    };
}
