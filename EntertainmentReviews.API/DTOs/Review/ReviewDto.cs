namespace EntertainmentReviews.API.DTOs.Review;

public class ReviewDto
{
    public string Id { get; set; } = string.Empty;
    public string CatalogItemId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string ItemTitle { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
