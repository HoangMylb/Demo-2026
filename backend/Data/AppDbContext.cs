using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
  public DbSet<User> Users => Set<User>();
  public DbSet<Product> Products => Set<Product>();
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

    modelBuilder.Entity<User>()
      .Property(user => user.Role)
      .HasMaxLength(32);

    modelBuilder.Entity<User>()
      .Property(user => user.UserName)
      .HasMaxLength(64);

    modelBuilder.Entity<User>()
      .Property(user => user.PasswordHash)
      .HasMaxLength(256);
  }
}
