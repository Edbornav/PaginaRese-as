using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EntertainmentReviews.API.DTOs.Request;
using EntertainmentReviews.API.Services.Interfaces;

namespace EntertainmentReviews.API.Controllers;

[ApiController]
[Route("api/requests")]
public class RequestController : ControllerBase
{
    private readonly IRequestService _requestService;

    public RequestController(IRequestService requestService) => _requestService = requestService;

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateItemRequestDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var request = await _requestService.CreateAsync(userId, dto);
        return CreatedAtAction(nameof(GetAll), request);
    }

    [Authorize(Roles = "admin")]
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status)
    {
        var requests = await _requestService.GetAllAsync(status);
        return Ok(requests);
    }

    [Authorize(Roles = "admin")]
    [HttpPut("{id}/approve")]
    public async Task<IActionResult> Approve(string id)
    {
        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var request = await _requestService.ApproveAsync(id, adminId);
        if (request == null) return NotFound();
        return Ok(request);
    }

    [Authorize(Roles = "admin")]
    [HttpPut("{id}/reject")]
    public async Task<IActionResult> Reject(string id)
    {
        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var request = await _requestService.RejectAsync(id, adminId);
        if (request == null) return NotFound();
        return Ok(request);
    }
}
