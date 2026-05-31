# Stage 1: Build code
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy toàn bộ code trong thư mục backend vào
COPY . .

# Chạy restore và build bản Release
RUN dotnet restore
RUN dotnet publish -c Release -o /app/publish

# Stage 2: Chạy App
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# LƯU Ý QUAN TRỌNG CHỖ NÀY:
# Thay "TenProjectCuaMay.dll" bằng đúng tên file dll của mày 
# (Thường nó sẽ giống y hệt tên file .csproj của mày)
ENTRYPOINT ["dotnet", "PortfolioAdmin.Api.dll"] 