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

    var desiredProducts = new[]
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
      },
      new Product
      {
        Name = "Studio Monitor Earbuds",
        Description = "Compact wireless earbuds tuned for crisp vocals and commute-ready ANC.",
        Price = 149,
        ImageUrl = "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?auto=format&fit=crop&w=900&q=80",
        CategoryId = categoriesByName["Audio"].Id
      },
      new Product
      {
        Name = "Orbit Fitness Band",
        Description = "A lightweight band with sleep tracking, step goals, and all-week comfort.",
        Price = 99,
        ImageUrl = "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=900&q=80",
        CategoryId = categoriesByName["Wearables"].Id
      },
      new Product
      {
        Name = "Flow Mechanical Keyboard",
        Description = "Tactile switches, quiet stabilizers, and a compact layout built for focused work.",
        Price = 159,
        ImageUrl = "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=900&q=80",
        CategoryId = categoriesByName["Workspace"].Id
      },
      new Product
      {
        Name = "Core Carry Sleeve",
        Description = "A structured everyday sleeve with soft lining for tablets, notes, and cables.",
        Price = 69,
        ImageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
        CategoryId = categoriesByName["Accessories"].Id
      }
    };

    var existingProducts = await context.Products.ToListAsync();

    foreach (var desiredProduct in desiredProducts)
    {
      var existingProduct = existingProducts.FirstOrDefault(product => product.Name == desiredProduct.Name);
      if (existingProduct is null)
      {
        await context.Products.AddAsync(desiredProduct);
        continue;
      }

      existingProduct.Description = desiredProduct.Description;
      existingProduct.Price = desiredProduct.Price;
      existingProduct.ImageUrl = desiredProduct.ImageUrl;
      existingProduct.CategoryId = desiredProduct.CategoryId;
      existingProduct.UpdatedAtUtc = DateTime.UtcNow;
    }

    await context.SaveChangesAsync();

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

    var productIdsByName = await context.Products.ToDictionaryAsync(product => product.Name, product => product.Id);
    var userIdsByEmail = await context.Users.ToDictionaryAsync(user => user.Email.ToLower(), user => user.Id);

    if (!await context.ProductReviews.AnyAsync())
    {
      var reviews = new[]
      {
        new ProductReview
        {
          ProductId = productIdsByName["Luma Air Headphones"],
          UserId = userIdsByEmail["user@gmail.com"],
          CustomerName = "Nguyen Minh Anh",
          Rating = 5,
          Comment = "Very clean sound, comfortable for long wear, and noise-cancelling is good enough to work in a coffee shop.",
          VariantType = "Wireless",
          Color = "Midnight Blue",
          Size = "Standard",
          PurchasedAtUtc = DateTime.UtcNow.AddDays(-42),
          CreatedAtUtc = DateTime.UtcNow.AddDays(-35),
        },
        new ProductReview
        {
          ProductId = productIdsByName["Luma Air Headphones"],
          UserId = userIdsByEmail["admin@gmail.com"],
          CustomerName = "Tran Gia Bao",
          Rating = 4,
          Comment = "Battery is solid, bass is punchy, call quality is clear. I love how compact they are and they don't heat up my ears.",
          VariantType = "Wireless",
          Color = "Silver Mist",
          Size = "Standard",
          PurchasedAtUtc = DateTime.UtcNow.AddDays(-21),
          CreatedAtUtc = DateTime.UtcNow.AddDays(-18),
        },
        new ProductReview
        {
          ProductId = productIdsByName["Pulse Smartwatch"],
          UserId = userIdsByEmail["locked@luma.dev"],
          CustomerName = "Le Thu Ha",
          Rating = 5,
          Comment = "Sleep tracking is quite accurate, the band is soft, vibration alerts are just right, and the design looks very sleek.",
          VariantType = "Sport Edition",
          Color = "Graphite Black",
          Size = "42mm",
          PurchasedAtUtc = DateTime.UtcNow.AddDays(-29),
          CreatedAtUtc = DateTime.UtcNow.AddDays(-24),
        },
        new ProductReview
        {
          ProductId = productIdsByName["Pulse Smartwatch"],
          UserId = userIdsByEmail["user@gmail.com"],
          CustomerName = "Pham Quoc Viet",
          Rating = 4,
          Comment = "The display is bright and beautiful, tracking is stable. If there were more watch faces, it would be perfect.",
          VariantType = "Everyday Edition",
          Color = "Sand Beige",
          Size = "44mm",
          PurchasedAtUtc = DateTime.UtcNow.AddDays(-14),
          CreatedAtUtc = DateTime.UtcNow.AddDays(-11),
        },
        new ProductReview
        {
          ProductId = productIdsByName["Arc Desk Lamp"],
          UserId = userIdsByEmail["admin@gmail.com"],
          CustomerName = "Hoang Linh Chi",
          Rating = 5,
          Comment = "Soft light, flexible angle adjustment, and perfect for a minimalist desk setup.",
          VariantType = "Desk Setup",
          Color = "Warm White",
          Size = "Medium",
          PurchasedAtUtc = DateTime.UtcNow.AddDays(-33),
          CreatedAtUtc = DateTime.UtcNow.AddDays(-27),
        },
        new ProductReview
        {
          ProductId = productIdsByName["Flow Mechanical Keyboard"],
          UserId = userIdsByEmail["user@gmail.com"],
          CustomerName = "Doan Tuan Kiet",
          Rating = 5,
          Comment = "Great typing feel, solid stabilizers, and a nice deep sound. Still enjoyable to use for coding all day.",
          VariantType = "Tactile Switch",
          Color = "Charcoal",
          Size = "75%",
          PurchasedAtUtc = DateTime.UtcNow.AddDays(-19),
          CreatedAtUtc = DateTime.UtcNow.AddDays(-13),
        },
        new ProductReview
        {
          ProductId = productIdsByName["Core Carry Sleeve"],
          UserId = userIdsByEmail["locked@luma.dev"],
          CustomerName = "Bui Khanh Vy",
          Rating = 4,
          Comment = "Nice material, sturdy build, fits a tablet with basic accessories quite neatly.",
          VariantType = "Travel Sleeve",
          Color = "Olive Grey",
          Size = "11-inch",
          PurchasedAtUtc = DateTime.UtcNow.AddDays(-10),
          CreatedAtUtc = DateTime.UtcNow.AddDays(-7),
        },
      };

      await context.ProductReviews.AddRangeAsync(reviews);
      await context.SaveChangesAsync();
    }
  }
}
