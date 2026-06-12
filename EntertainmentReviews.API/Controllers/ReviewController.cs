using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EntertainmentReviews.API.DTOs.Review;
using EntertainmentReviews.API.Services.Interfaces;

namespace EntertainmentReviews.API.Controllers;

[ApiController]
public class ReviewController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewController(IReviewService reviewService) => _reviewService = reviewService;

    [HttpGet("api/catalog/{catalogItemId}/reviews")]
    public async Task<IActionResult> GetByCatalogItem(string catalogItemId)
    {
        var reviews = await _reviewService.GetByCatalogItemIdAsync(catalogItemId);
        return Ok(reviews);
    }

    [Authorize]
    [HttpPost("api/catalog/{catalogItemId}/reviews")]
    public async Task<IActionResult> Create(string catalogItemId, [FromBody] CreateReviewDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Comment))
            return BadRequest(new { error = "Comment is required" });

        if (dto.Rating < 0 || dto.Rating > 10)
            return BadRequest(new { error = "Rating must be between 0 and 10" });

        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var username = User.FindFirstValue(ClaimTypes.Name)!;
            var review = await _reviewService.CreateAsync(catalogItemId, userId, username, dto);
            return CreatedAtAction(nameof(GetByCatalogItem), new { catalogItemId }, review);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("api/reviews/user/{userId}")]
    public async Task<IActionResult> GetByUser(string userId)
    {
        var reviews = await _reviewService.GetByUserIdAsync(userId);
        return Ok(reviews);
    }

    [Authorize]
    [HttpPut("api/reviews/{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] CreateReviewDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Comment))
            return BadRequest(new { error = "Comment is required" });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var review = await _reviewService.UpdateAsync(id, userId, dto);
        if (review == null) return Forbid();
        return Ok(review);
    }

    [Authorize]
    [HttpDelete("api/reviews/{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var role = User.FindFirstValue(ClaimTypes.Role);
        var result = await _reviewService.DeleteAsync(id, userId, role);
        if (!result) return Forbid();
        return NoContent();
    }
}
