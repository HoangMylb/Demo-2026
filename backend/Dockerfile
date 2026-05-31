# Stage 1: Build code
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy toàn bộ code trong thư mục backend vào
COPY . .

# Chạy restore và build bản Release
RUN dotnet restore
RUN dotnet publish -c Release -o /app/publish

# Stage 2: Chạy App
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Chạy đúng cái tên file dll của mày
ENTRYPOINT ["dotnet", "PortfolioAdmin.Api.dll"]