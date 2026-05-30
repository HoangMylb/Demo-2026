using Backend.Models;
using Backend.Services;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public static class AppDbSeeder
{
  public static async Task SeedAsync(AppDbContext context)
  {
    if (!await context.Categories.AnyAsync())
    {
      var categories = new[]
      {
        new Category { Name = "Audio" },
        new Category { Name = "Wearables" },
        new Category { Name = "Workspace" },
        new Category { Name = "Accessories" }
      };

      await context.Categories.AddRangeAsync(categories);
      await context.SaveChangesAsync();
    }

    var categoriesByName = await context.Categories.ToDictionaryAsync(category => category.Name);

    if (!await context.Products.AnyAsync())
    {
      var products = new[]
      {
        new Product
        {
          Name = "Luma Air Headphones",
          Description = "Adaptive noise canceling headphones with spatial audio tuning.",
          Price = 249,
          ImageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
          CategoryId = categoriesByName["Audio"].Id
        },
        new Product
        {
          Name = "Pulse Smartwatch",
          Description = "Health tracking and all-day battery life in one minimalist shell.",
          Price = 189,
          ImageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30e?auto=format&fit=crop&w=900&q=80",
          CategoryId = categoriesByName["Wearables"].Id
        },
        new Product
        {
          Name = "Arc Desk Lamp",
          Description = "A dimmable lamp with warm-to-cool presets for deep work.",
          Price = 129,
          ImageUrl = "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=80",
          CategoryId = categoriesByName["Workspace"].Id
        }
      };

      await context.Products.AddRangeAsync(products);
      await context.SaveChangesAsync();
    }

    var desiredUsers = new[]
    {
      new User
      {
        FullName = "System Admin",
        UserName = "admin",
        Email = "admin@gmail.com",
        PasswordHash = PasswordHasher.HashPassword("123456"),
        Role = "Admin",
        IsApproved = true,
        IsLocked = false
      },
      new User
      {
        FullName = "Standard User",
        UserName = "user",
        Email = "user@gmail.com",
        PasswordHash = PasswordHasher.HashPassword("123456"),
        Role = "User",
        IsApproved = true,
        IsLocked = false
      },
      new User
      {
        FullName = "Locked Demo User",
        UserName = "locked-user",
        Email = "locked@luma.dev",
        PasswordHash = PasswordHasher.HashPassword("123456"),
        Role = "User",
        IsApproved = true,
        IsLocked = true
      }
    };

    var existingUsers = await context.Users.ToListAsync();

    foreach (var desiredUser in desiredUsers)
    {
      var existingUser = existingUsers.FirstOrDefault(user => user.Email.ToLower() == desiredUser.Email.ToLower());
      if (existingUser is null)
      {
        await context.Users.AddAsync(desiredUser);
        continue;
      }

      existingUser.FullName = desiredUser.FullName;
      existingUser.UserName = desiredUser.UserName;
      existingUser.PasswordHash = desiredUser.PasswordHash;
      existingUser.Role = desiredUser.Role;
      existingUser.IsApproved = desiredUser.IsApproved;
      existingUser.IsLocked = desiredUser.IsLocked;
    }

    await context.SaveChangesAsync();
  }
}
