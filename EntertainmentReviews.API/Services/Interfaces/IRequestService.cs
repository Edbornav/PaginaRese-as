using EntertainmentReviews.API.DTOs.Request;

namespace EntertainmentReviews.API.Services.Interfaces;

public interface IRequestService
{
    Task<List<ItemRequestDto>> GetAllAsync(string? status = null);
    Task<ItemRequestDto> CreateAsync(string userId, CreateItemRequestDto dto);
    Task<ItemRequestDto?> ApproveAsync(string id, string adminId);
    Task<ItemRequestDto?> RejectAsync(string id, string adminId);
}
