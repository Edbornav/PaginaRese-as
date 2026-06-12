namespace EntertainmentReviews.API.DTOs.Request;

public class CreateItemRequestDto
{
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string CoverImageUrl { get; set; } = string.Empty;
    public DateTime ReleaseDate { get; set; }
    public string Creator { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
