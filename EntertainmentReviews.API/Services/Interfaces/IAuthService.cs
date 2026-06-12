using EntertainmentReviews.API.DTOs.Auth;

namespace EntertainmentReviews.API.Services.Interfaces;

public interface IAuthService
{
    Task<string> RegisterAsync(RegisterDto dto);
    Task<string?> LoginAsync(LoginDto dto);
}
