using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
  public DbSet<User> Users => Set<User>();
  public DbSet<Product> Products => Set<Product>();
  public DbSet<ProductReview> ProductReviews => Set<ProductReview>();
  public DbSet<ProductReviewHelpfulVote> ProductReviewHelpfulVotes => Set<ProductReviewHelpfulVote>();
  public DbSet<Order> Orders => Set<Order>();
  public DbSet<OrderItem> OrderItems => Set<OrderItem>();
  public DbSet<Category> Categories => Set<Category>();

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    modelBuilder.Entity<User>()
      .HasIndex(user => user.Email)
      .IsUnique();

    modelBuilder.Entity<User>()
      .HasIndex(user => user.UserName)
      .IsUnique();

    modelBuilder.Entity<Category>()
      .HasMany(category => category.Products)
      .WithOne(product => product.Category)
      .HasForeignKey(product => product.CategoryId)
      .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Product>()
      .HasMany(product => product.Reviews)
      .WithOne(review => review.Product)
      .HasForeignKey(review => review.ProductId)
      .OnDelete(DeleteBehavior.Cascade);

    modelBuilder.Entity<User>()
      .HasMany(user => user.ProductReviews)
      .WithOne(review => review.User)
      .HasForeignKey(review => review.UserId)
      .OnDelete(DeleteBehavior.Cascade);

    modelBuilder.Entity<ProductReview>()
      .HasMany(review => review.HelpfulVotes)
      .WithOne(vote => vote.ProductReview)
      .HasForeignKey(vote => vote.ProductReviewId)
      .OnDelete(DeleteBehavior.Cascade);

    modelBuilder.Entity<User>()
      .HasMany(user => user.ProductReviewHelpfulVotes)
      .WithOne(vote => vote.User)
      .HasForeignKey(vote => vote.UserId)
      .OnDelete(DeleteBehavior.Cascade);

    modelBuilder.Entity<User>()
      .HasMany(user => user.Orders)
      .WithOne(order => order.User)
      .HasForeignKey(order => order.UserId)
      .OnDelete(DeleteBehavior.Cascade);

    modelBuilder.Entity<Order>()
      .HasMany(order => order.Items)
      .WithOne(item => item.Order)
      .HasForeignKey(item => item.OrderId)
      .OnDelete(DeleteBehavior.Cascade);

    modelBuilder.Entity<OrderItem>()
      .HasOne(item => item.Product)
      .WithMany()
      .HasForeignKey(item => item.ProductId)
      .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<ProductReview>()
      .HasIndex(review => new { review.ProductId, review.UserId })
      .IsUnique();

    modelBuilder.Entity<ProductReviewHelpfulVote>()
      .HasIndex(vote => new { vote.ProductReviewId, vote.UserId })
      .IsUnique();

    modelBuilder.Entity<User>()
      .Property(user => user.Role)
      .HasMaxLength(32);

    modelBuilder.Entity<User>()
      .Property(user => user.UserName)
      .HasMaxLength(64);

    modelBuilder.Entity<User>()
      .Property(user => user.PasswordHash)
      .HasMaxLength(256);

    modelBuilder.Entity<User>()
      .Property(user => user.PhoneNumber)
      .HasMaxLength(32);

    modelBuilder.Entity<User>()
      .Property(user => user.Address)
      .HasMaxLength(500);

    modelBuilder.Entity<Order>()
      .Property(order => order.Status)
      .HasMaxLength(32);

    modelBuilder.Entity<Order>()
      .Property(order => order.PaymentStatus)
      .HasMaxLength(32);

    modelBuilder.Entity<Order>()
      .Property(order => order.CustomerEmail)
      .HasMaxLength(256);

    modelBuilder.Entity<Order>()
      .Property(order => order.CustomerName)
      .HasMaxLength(160);

    modelBuilder.Entity<Order>()
      .Property(order => order.PhoneNumber)
      .HasMaxLength(32);

    modelBuilder.Entity<Order>()
      .Property(order => order.ShippingAddress)
      .HasMaxLength(500);

    modelBuilder.Entity<Order>()
      .Property(order => order.Currency)
      .HasMaxLength(8);

    modelBuilder.Entity<OrderItem>()
      .Property(item => item.ProductName)
      .HasMaxLength(160);

    modelBuilder.Entity<OrderItem>()
      .Property(item => item.ProductImageUrl)
      .HasMaxLength(1000);

    modelBuilder.Entity<ProductReview>()
      .Property(review => review.CustomerName)
      .HasMaxLength(120);

    modelBuilder.Entity<ProductReview>()
      .Property(review => review.VariantType)
      .HasMaxLength(80);

    modelBuilder.Entity<ProductReview>()
      .Property(review => review.Color)
      .HasMaxLength(80);

    modelBuilder.Entity<ProductReview>()
      .Property(review => review.Size)
      .HasMaxLength(80);

    modelBuilder.Entity<ProductReview>()
      .Property(review => review.Rating)
      .HasDefaultValue(5);

    modelBuilder.Entity<ProductReview>()
      .Property(review => review.HelpfulCount)
      .HasDefaultValue(0);
  }
}
