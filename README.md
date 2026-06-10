# Demo-2026

## Tổng quan dự án

Đây là một dự án **fullstack e-commerce / admin dashboard** gồm:

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + Ant Design
- **Backend**: ASP.NET Core Web API **.NET 9.0**
- **Database**: **Supabase PostgreSQL**
- **Triển khai**:
  - **Frontend** deploy trên **Vercel**
  - **Backend** deploy trên **Render**
  - **Domain / DNS** quản lý bằng **Hostinger**

Mục tiêu của project là xây dựng một hệ thống storefront hiện đại cho người dùng cuối, đồng thời có khu vực quản trị riêng cho admin để quản lý sản phẩm, người dùng và review.

---

## Kiến trúc tổng thể

### 1. Frontend

Frontend nằm ở thư mục gốc `src/`, được xây bằng:

- **React 18**
- **Vite 6**
- **TypeScript** (`.ts`, `.tsx`)
- **Tailwind CSS**
- **Ant Design**
- **React Router DOM**
- **Zustand**
- **React Hook Form + Zod**
- **Framer Motion**
- **Recharts**

Frontend chịu trách nhiệm:

- Hiển thị giao diện storefront
- Hiển thị chi tiết sản phẩm
- Giỏ hàng phía client
- Đăng nhập / đăng ký người dùng
- Đăng nhập admin
- Quản trị dashboard / users / products / reviews
- Gửi request đến backend API

### 2. Backend

Backend nằm trong thư mục `backend/`, được xây bằng:

- **ASP.NET Core Web API**
- **.NET 9.0**
- **Entity Framework Core 9**
- **Npgsql EntityFrameworkCore PostgreSQL**
- **JWT Authentication**
- **Cookie-based token transport**
- **Google OAuth**
- **Facebook OAuth**
- **Swagger / Swashbuckle**

Backend chịu trách nhiệm:

- Xử lý authentication / authorization
- CRUD sản phẩm
- Quản lý người dùng
- Quản lý review sản phẩm
- Cấp quyền admin
- Kết nối và thao tác dữ liệu với Supabase PostgreSQL

### 3. Database

Project đang dùng **Supabase** làm nền tảng cơ sở dữ liệu, cụ thể trong code hiện tại:

- Dùng **Supabase PostgreSQL** làm DB chính
- Backend kết nối bằng **connection string PostgreSQL** qua `UseNpgsql(...)`
- Dùng **EF Core migrations** để tạo và cập nhật schema

Lưu ý: theo code hiện tại, project đang dùng **Supabase như managed Postgres**, không thấy frontend/backend gọi trực tiếp Supabase SDK. Authentication chính đang được xử lý bởi backend .NET với JWT, không phải Supabase Auth trong phần code hiện tại.

---

## Công nghệ đã sử dụng

## Frontend stack

Từ `package.json` và `src/` có thể xác định các công nghệ sau:

- **React** – xây dựng UI component-based
- **TypeScript / TSX** – tăng type safety cho frontend
- **JSX / TSX** – render component
- **Vite** – dev server + build tool
- **Tailwind CSS** – utility-first CSS
- **PostCSS + Autoprefixer** – xử lý CSS
- **Ant Design** – component library cho form, table, modal, card, button...
- **@ant-design/icons** – icon hệ AntD
- **lucide-react** – icon hiện đại bổ sung
- **react-router-dom** – routing SPA
- **zustand** – state management nhẹ cho cart và theme
- **react-hook-form** – quản lý form
- **zod** – schema validation
- **@hookform/resolvers** – nối React Hook Form với Zod
- **framer-motion** – animation / motion UI
- **recharts** – biểu đồ ở admin dashboard

## Backend stack

Từ `backend/PortfolioAdmin.Api.csproj` và `Program.cs`:

- **ASP.NET Core Web API**
- **.NET 9.0**
- **Entity Framework Core 9**
- **Npgsql PostgreSQL provider**
- **JWT Bearer Authentication**
- **Cookie Authentication** cho external login flow
- **Google Authentication**
- **Facebook Authentication**
- **Swagger / Swashbuckle**
- **CORS policy** cho local FE và FE production trên Vercel / domain riêng

---

## Third-party services / API / nền tảng bên thứ 3

### 1. Supabase

Vai trò trong dự án:

- Là **database layer**
- Host **PostgreSQL managed database**
- Backend kết nối trực tiếp bằng connection string
- Phù hợp để chạy production mà không cần tự dựng PostgreSQL server riêng

Trong code thể hiện ở:

- `backend/Program.cs`
- `backend/appsettings.json`
- `backend/README.md`

### 2. Render

Vai trò:

- Dùng để deploy **backend ASP.NET Core API**
- Backend production URL mặc định trong frontend đang trỏ tới:
  - `https://hoangmydemo-api.onrender.com`

Trong code thể hiện ở:

- `src/lib/api-base-url.ts`

### 3. Vercel

Vai trò:

- Dùng để deploy **frontend React/Vite**
- Có cấu hình rewrite để SPA route luôn trả về `index.html`

Trong code thể hiện ở:

- `vercel.json`
- CORS production backend cho phép origin Vercel trong `backend/Program.cs`

### 4. Hostinger

Vai trò:

- Dùng để **quản lý domain / DNS**
- Domain production đang được trỏ về frontend chính
- Có thể dùng subdomain/API mapping sang Render

Theo thông tin bạn cung cấp và code production hiện tại:

- Frontend domain chính: `https://hoangmydemo.online`
- WWW: `https://www.hoangmydemo.online`
- Backend API: `https://hoangmydemo-api.onrender.com`

### 5. Google OAuth

Vai trò:

- Cho phép user login bằng Google

Trong code thể hiện ở:

- `backend/Program.cs`
- `backend/Controllers/AuthController.cs`
- `src/components/auth/auth-form.tsx`

### 6. Facebook OAuth

Vai trò:

- Cho phép user login bằng Facebook

Trong code thể hiện ở:

- `backend/Program.cs`
- `backend/Controllers/AuthController.cs`
- `src/components/auth/auth-form.tsx`

---

## Cấu trúc chức năng trong `src`

Thư mục `src/` là trung tâm của frontend, gồm các nhóm chức năng chính sau:

### 1. `src/main.tsx`

Điểm khởi động ứng dụng:

- Mount React app
- Cấu hình `ConfigProvider` của Ant Design
- Tùy biến token theme
- Bọc app bằng `BrowserRouter`

### 2. `src/App.tsx`

Đây là file điều phối chính của frontend:

- Khởi tạo routing toàn app
- Lazy-load page bằng `React.lazy`
- Nạp session hiện tại
- Điều hướng giữa store và admin
- Tích hợp `MiniCart`, `AddToCartModal`
- Tích hợp `AppErrorBoundary`

### 3. `src/lib/*`

#### `src/lib/admin-api.ts`

Quản lý toàn bộ request liên quan đến admin / auth / profile:

- login
- register
- logout
- lấy session hiện tại
- lấy thống kê admin
- CRUD products cho admin
- CRUD users cho admin
- CRUD reviews cho admin
- profile user

#### `src/lib/storefront-api.ts`

Quản lý API cho phía storefront:

- lấy danh sách sản phẩm
- lấy chi tiết sản phẩm
- tạo review
- sửa review
- xóa review
- vote helpful cho review

#### `src/lib/api-base-url.ts`

Xử lý base URL API:

- ưu tiên `VITE_API_BASE_URL`
- nếu không có thì fallback về Render production API
- tự xử lý khác biệt giữa local và production

### 4. `src/pages/*`

#### `home-page.tsx`
- Trang chủ storefront
- Gồm hero section và featured products

#### `products-page.tsx`
- Danh sách sản phẩm
- Tìm kiếm client-side
- Lọc theo category
- Phân trang client-side

#### `product-detail-page.tsx`
- Trang chi tiết sản phẩm
- Hiển thị rating, review count, related products
- Cho phép user đăng review
- Sửa / xóa review của chính mình
- Vote helpful cho review người khác
- Có filter/sort review
- Có animation bằng Framer Motion

#### `auth-page.tsx`
- Trang đăng nhập / đăng ký
- Phân biệt audience: `store` và `admin`

#### `settings-page.tsx`
- Trang cập nhật profile user
- Sửa full name / username / email
- Hiển thị role, approval, lock status

#### `admin-dashboard-page.tsx`
- Dashboard tổng quan
- Hiển thị số users / products
- Biểu đồ phân bố category bằng Recharts

#### `admin-products-page.tsx`
- Quản lý sản phẩm
- Tạo / sửa / xóa sản phẩm
- Search / filter category
- Upload ảnh từ local file hoặc nhập URL
- Preview ảnh trước khi lưu

#### `admin-users-page.tsx`
- Quản lý người dùng
- Tạo user mới
- Sửa thông tin user
- Khóa / mở khóa tài khoản
- Approve / revoke approval
- Xóa user
- Chặn admin tự gỡ quyền admin của chính mình

#### `admin-reviews-page.tsx`
- Quản lý review
- Search review
- Filter theo product, rating, helpful count
- Xóa review

#### `not-found-page.tsx`, `unauthorized-page.tsx`, `crash-page.tsx`
- Xử lý lỗi route / quyền truy cập / lỗi giao diện

### 5. `src/components/*`

Project chia component khá rõ theo domain:

- `components/auth` – form auth
- `components/admin` – layout và admin shell
- `components/cart` – mini cart, modal add to cart
- `components/layout` – navbar, footer, theme toggle
- `components/product` – product card, filter, pagination
- `components/sections` – hero, featured products
- `components/feedback` – error boundary, error showcase

### 6. `src/stores/*`

#### `cart-store.ts`
- Dùng **Zustand + persist**
- Lưu giỏ hàng vào `localStorage`
- Tính `itemCount`, `totalPrice`

#### `theme-store.ts`
- Dùng **Zustand + persist**
- Lưu theme `light/dark`
- Đồng bộ theme giữa các lần reload

### 7. `src/hooks/*`

#### `use-theme-effect.ts`
- Đồng bộ theme state ra DOM/class để hỗ trợ dark mode

### 8. `src/utils/*`

- `format.ts` – helper format dữ liệu, ví dụ giá tiền
- `styles.ts` – helper style/class utility

---

## Backend API hiện có

## Auth API

Từ `backend/Controllers/AuthController.cs`:

- `GET /api/auth/providers` – kiểm tra provider login khả dụng
- `GET /api/auth/external/{provider}` – bắt đầu OAuth login
- `GET /api/auth/external/{provider}/callback` – callback OAuth
- `POST /api/auth/register` – đăng ký user
- `POST /api/auth/login` – đăng nhập
- `GET /api/auth/me` – lấy session hiện tại
- `POST /api/auth/logout` – đăng xuất

### Products API

Từ `backend/Controllers/ProductsController.cs`:

- `GET /api/products` – danh sách sản phẩm storefront
- `GET /api/products/{id}` – chi tiết sản phẩm
- `POST /api/products/{id}/reviews` – tạo review
- `PUT /api/products/{productId}/reviews/{reviewId}` – sửa review
- `DELETE /api/products/{productId}/reviews/{reviewId}` – xóa review
- `POST /api/products/{productId}/reviews/{reviewId}/helpful` – vote helpful

### Admin API

#### Dashboard
- `GET /api/admin/dashboard/stats`

#### Products
- `GET /api/admin/products`
- `GET /api/admin/products/{id}`
- `POST /api/admin/products`
- `PUT /api/admin/products/{id}`
- `DELETE /api/admin/products/{id}`

#### Users
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PATCH /api/admin/users/{id}/access`
- `DELETE /api/admin/users/{id}`

#### Reviews
- `GET /api/admin/reviews`
- `DELETE /api/admin/reviews/{id}`

### Profile API

Từ `backend/Controllers/ProfileController.cs`:

- `GET /api/profile`
- `PUT /api/profile`

---

## Các kỹ năng / kỹ thuật đã sử dụng trong source

Đây là phần quan trọng để hiểu “trình độ thực thi” của source code.

### 1. SPA Routing

Đã dùng **React Router DOM** để xây SPA nhiều route:

- public store routes
- auth routes
- admin routes
- unauthorized / not found routes

### 2. Code Splitting / Lazy Loading

Trong `src/App.tsx` có dùng:

- `React.lazy(...)`
- `Suspense`

=> Giúp giảm initial bundle và tải trang hiệu quả hơn.

### 3. Bundle Optimization

Trong `vite.config.ts` có cấu hình `manualChunks` để tách vendor bundle theo nhóm:

- antd
- charts
- router
- forms
- motion
- icons
- state
- react core

=> Đây là kỹ thuật tối ưu performance build cho production.

### 4. Theme System / Dark Mode

Project có:

- `tailwind.config.ts` dùng `darkMode: 'class'`
- store riêng cho theme
- effect hook đồng bộ theme ra UI
- token theme Ant Design map vào CSS variables

=> Đây là kỹ thuật kết hợp **Tailwind + design tokens + Ant Design theme customization**.

### 5. State Management với Zustand

Đã dùng Zustand cho:

- cart state
- theme state

Kèm `persist` để lưu vào localStorage.

### 6. Form Handling & Validation

Đã dùng:

- `react-hook-form`
- `zod`
- `@hookform/resolvers/zod`

=> Form login/register có validation schema rõ ràng.

### 7. Error Handling

Frontend có:

- `AppErrorBoundary`
- custom error message cho API request
- fallback khi load thất bại

Backend có:

- response wrapper chuẩn
- status code rõ ràng: `401`, `403`, `404`, `409`, `400`

### 8. Authentication & Authorization

Backend áp dụng:

- **JWT Bearer**
- Lấy token từ **HttpOnly cookie**
- `[Authorize]`
- `[Authorize(Roles = "Admin")]`

=> Đây là mô hình auth tương đối chuẩn cho app có user thường và admin.

### 9. OAuth Integration

Đã hỗ trợ:

- Google login
- Facebook login

### 10. Role-based Access Control

Project có phân quyền rõ:

- `User`
- `Admin`

Admin mới truy cập được:

- dashboard
- users management
- products management
- reviews management

### 11. EF Core ORM & Database Modeling

Đã dùng:

- `DbContext`
- migrations
- relationships
- unique indexes
- `Include`, `ThenInclude`
- `AsNoTracking`

### 12. Data Integrity & Business Rules

Trong backend có nhiều rule quan trọng:

- email phải unique
- username phải unique
- một user chỉ review một product một lần
- một user chỉ helpful vote một review một lần
- không được vote helpful cho review của chính mình
- không được tự xóa tài khoản admin hiện tại
- không được tự bỏ quyền admin của chính mình

### 13. CRUD Management UI

Admin pages thể hiện kỹ năng xây dashboard thực tế:

- Table data grid
- Modal create/edit
- Popconfirm delete
- Search/filter
- Status tags
- File upload preview

### 14. Client-side UX Enhancements

Có nhiều điểm UX tốt:

- toast message
- loading state
- empty state
- graceful fallback
- review sorting/filtering
- image preview khi upload

### 15. Charting / Data Visualization

Admin dashboard dùng **Recharts** để hiển thị phân bố sản phẩm theo category.

### 16. Production Deployment Awareness

Code đã thể hiện tư duy triển khai thực tế:

- tách local/prod CORS policy
- fallback API base URL production
- Vercel rewrite cho SPA
- redirect frontend theo môi trường
- cookie `SameSite` / `Secure` theo môi trường

---

## Mô hình dữ liệu chính

Từ `backend/Data/AppDbContext.cs`, hệ thống đang có các entity chính:

- **User**
- **Product**
- **Category**
- **ProductReview**
- **ProductReviewHelpfulVote**

### Quan hệ dữ liệu

- `Category` 1 - N `Product`
- `Product` 1 - N `ProductReview`
- `User` 1 - N `ProductReview`
- `ProductReview` 1 - N `ProductReviewHelpfulVote`
- `User` 1 - N `ProductReviewHelpfulVote`

### Ràng buộc nổi bật

- unique index cho `User.Email`
- unique index cho `User.UserName`
- unique index cho `(ProductId, UserId)` trong review
- unique index cho `(ProductReviewId, UserId)` trong helpful vote

---

## Luồng nghiệp vụ chính

### 1. Luồng người dùng storefront

1. Vào trang chủ
2. Xem featured products
3. Tìm kiếm / lọc sản phẩm
4. Xem trang chi tiết
5. Thêm vào giỏ hàng
6. Đăng ký / đăng nhập
7. Review sản phẩm
8. Vote helpful cho review khác
9. Cập nhật profile cá nhân

### 2. Luồng admin

1. Đăng nhập admin
2. Vào dashboard tổng quan
3. Quản lý danh mục sản phẩm đang có
4. Thêm / sửa / xóa sản phẩm
5. Quản lý user
6. Khóa / mở khóa / approve user
7. Quản lý review và xóa review không phù hợp

---

## Cấu hình môi trường

## Frontend

Biến môi trường quan trọng:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Production có thể dùng:

```env
VITE_API_BASE_URL=https://hoangmydemo-api.onrender.com
```

## Backend

Backend cần các cấu hình như:

- PostgreSQL connection string
- JWT issuer / audience / key
- Google OAuth credentials
- Facebook OAuth credentials
- Frontend base URL

Ví dụ các nhóm biến cấu hình:

```env
SUPABASE_CONNECTION_STRING=your_supabase_postgres_connection

Jwt__Issuer=PortfolioAdmin
Jwt__Audience=PortfolioAdminClient
Jwt__Key=your_strong_secret_key

Authentication__Google__ClientId=...
Authentication__Google__ClientSecret=...

Authentication__Facebook__AppId=...
Authentication__Facebook__AppSecret=...

Frontend__BaseUrl=https://hoangmydemo.online
```

---

## Chạy dự án local

## 1. Frontend

```bash
npm install
npm run dev
```

Frontend mặc định chạy với Vite.

## 2. Backend

```bash
cd backend
dotnet restore
dotnet run
```

Nếu dùng local frontend với local backend, nên cấu hình:

```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## Triển khai production

### Frontend – Vercel

- Build từ source React/Vite
- Rewrite toàn bộ route về `index.html`
- Dùng domain custom

### Backend – Render

- Host ASP.NET Core Web API
- Expose public API URL
- Quản lý environment variables trên dashboard Render

### Database – Supabase

- PostgreSQL managed database
- Backend kết nối bằng connection string
- EF migrations chạy để đồng bộ schema

### Domain – Hostinger

- Quản lý DNS / domain chính
- Trỏ domain frontend về Vercel
- Có thể trỏ subdomain API về Render

---

## Những điểm mạnh của source code hiện tại

- Có tách biệt rõ frontend và backend
- Có auth user và admin
- Có dashboard quản trị tương đối hoàn chỉnh
- Có review system khá chi tiết
- Có state management gọn, không over-engineered
- Có tối ưu build frontend
- Có chuẩn bị cho production deployment
- Có persistence cho cart và theme
- Có validation form phía client và business rule phía server

---

## Những gì README này giúp bạn hiểu nhanh

Sau khi đọc file này, bạn có thể nắm được:

- Project đang dùng công nghệ gì
- Dự án đang kết nối dịch vụ bên thứ 3 nào
- Kiến trúc frontend/backend/database ra sao
- Các API backend đang có
- Các kỹ thuật và kỹ năng đã được áp dụng trong source
- Luồng hoạt động của user và admin
- Cách chạy local và hướng triển khai production

---

## Tóm tắt ngắn gọn

Đây là một project **fullstack thương mại điện tử + admin dashboard** với:

- **Frontend**: React + Vite + TypeScript + Tailwind + Ant Design
- **Backend**: ASP.NET Core Web API .NET 9.0
- **DB**: Supabase PostgreSQL
- **Deploy**: Vercel + Render
- **DNS/Domain**: Hostinger
- **Auth**: JWT + cookie + Google/Facebook OAuth
- **State**: Zustand
- **Validation**: React Hook Form + Zod
- **Chart**: Recharts

Nếu cần mở rộng tiếp, đây là base khá tốt để phát triển thêm các module như checkout, order management, payment integration, media storage, notifications hoặc analytics.
