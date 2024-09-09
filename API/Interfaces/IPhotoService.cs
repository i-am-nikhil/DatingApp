using CloudinaryDotNet.Actions;

namespace API.Interfaces;

public interface IPhotoService
{
    Task<ImageUploadResult> AddPhotoAsync(IFormFile file); // ImageUploadResult is provided by Cloudinary
    Task<DeletionResult> DeletePhotoAsync(string publicId);
}
