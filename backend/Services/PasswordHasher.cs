using System.Security.Cryptography;

namespace Backend.Services;

public static class PasswordHasher
{
  private const int SaltSize = 16;
  private const int KeySize = 32;
  private const int Iterations = 100_000;

  public static string HashPassword(string password)
  {
    var salt = RandomNumberGenerator.GetBytes(SaltSize);
    var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, KeySize);

    return string.Join('.', Convert.ToBase64String(salt), Convert.ToBase64String(hash));
  }

  public static bool VerifyPassword(string password, string storedHash)
  {
    var parts = storedHash.Split('.', StringSplitOptions.RemoveEmptyEntries);
    if (parts.Length != 2)
    {
      return false;
    }

    try
    {
      var salt = Convert.FromBase64String(parts[0]);
      var hash = Convert.FromBase64String(parts[1]);
      var computedHash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, hash.Length);

      return CryptographicOperations.FixedTimeEquals(hash, computedHash);
    }
    catch (FormatException)
    {
      return false;
    }
  }
}
