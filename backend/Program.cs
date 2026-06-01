using System.Text;
using Backend.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
  ?? builder.Configuration["SUPABASE_CONNECTION_STRING"]
  ?? throw new InvalidOperationException("A PostgreSQL connection string is required. Set ConnectionStrings:DefaultConnection or SUPABASE_CONNECTION_STRING.");

builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

var jwtSection = builder.Configuration.GetSection("Jwt");
var issuer = jwtSection["Issuer"] ?? "PortfolioAdmin";
var audience = jwtSection["Audience"] ?? "PortfolioAdminClient";
var key = jwtSection["Key"] ?? throw new InvalidOperationException("JWT signing key is missing.");

builder.Services
  .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
  .AddJwtBearer(options =>
  {
    options.TokenValidationParameters = new TokenValidationParameters
    {
      ValidateIssuer = true,
      ValidateAudience = true,
      ValidateLifetime = true,
      ValidateIssuerSigningKey = true,
      ValidIssuer = issuer,
      ValidAudience = audience,
      IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
    };
  });

builder.Services.AddAuthorization();
builder.Services.AddCors(options =>
{
  options.AddPolicy("Frontend", policy =>
  {
    policy.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod();
  });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowVercel",
        policy =>
        {
            policy.WithOrigins(
                    "http://localhost:5000",
                    "http://localhost:5173",
                    "https://hoangmydemo.online",
                    "https://www.hoangmydemo.online",
                    "https://demo-2026-rho.vercel.app" // Thêm cả cái này vào cho chắc cốp
                )
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials(); 
        });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
  var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
  await dbContext.Database.MigrateAsync();
  await AppDbSeeder.SeedAsync(dbContext);
}

if (app.Environment.IsDevelopment())
{
  app.UseSwagger();
  app.UseSwaggerUI();
}
app.UseRouting();
app.UseHttpsRedirection();
app.UseCors("AllowVercel");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
