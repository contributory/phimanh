# Query Params Fix - Homepage

## Vấn đề (Problem)
Query params trên màn hình chính (homepage) hoàn toàn không hoạt động. Khi người dùng chọn category hoặc topic từ dropdown, URL thay đổi nhưng nội dung không cập nhật.

## Nguyên nhân (Root Cause)
1. **app/page.tsx**: Mặc dù nhận được `category` và `topic` từ searchParams, nhưng không truyền chúng xuống các component con
2. **MovieListClient**: Component này luôn fetch cùng một endpoint (`/danh-sach/phim-moi-cap-nhat`) bất kể có category/topic filter hay không
3. **Pagination**: Component này cũng luôn fetch cùng một endpoint để lấy pagination info
4. **Header**: Không nhận được giá trị hiện tại của category/topic nên dropdown không hiển thị đúng option đang được chọn

## Giải pháp (Solution)

### 1. app/page.tsx
**Thay đổi:**
- Trích xuất `category` và `topic` từ searchParams
- Xác định `currentValue` và `isCategory` dựa trên query params
- Truyền các giá trị này xuống Header component
- Truyền `category` và `topic` xuống MovieListClient component

**Code:**
```typescript
const { index, category, topic } = await searchParams;
const currentValue = category || topic || "";
const isCategory = category ? true : topic ? false : undefined;

<Header
  currentValue={currentValue}
  isCategory={isCategory}
  topics={topics}
  categories={categories}
/>
<MovieListClient 
  index={index || 1} 
  category={category}
  topic={topic}
/>
```

### 2. components/movie/MovieListClient.tsx
**Thay đổi:**
- Thêm `category` và `topic` vào props interface
- Xây dựng URL động dựa trên filter:
  - Nếu có category: `/v1/api/the-loai/${category}?page=${index}`
  - Nếu có topic: `/v1/api/danh-sach/${topic}?page=${index}`
  - Mặc định: `/danh-sach/phim-moi-cap-nhat?page=${index}`
- Xử lý cấu trúc response khác nhau giữa các endpoint
- Thêm `category` và `topic` vào dependency array của useEffect

**Code:**
```typescript
interface MovieListClientProps {
  index?: number;
  category?: string;
  topic?: string;
}

let url: string;
if (category) {
  url = `https://phimapi.com/v1/api/the-loai/${category}?page=${index}`;
} else if (topic) {
  url = `https://phimapi.com/v1/api/danh-sach/${topic}?page=${index}`;
} else {
  url = `https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=${index}`;
}
```

### 3. components/pagination.tsx
**Thay đổi:**
- Đọc `category` và `topic` từ searchParams
- Xây dựng URL động tương tự như MovieListClient
- Xử lý cấu trúc response khác nhau để lấy pagination info

**Code:**
```typescript
const category = searchParams.get("category");
const topic = searchParams.get("topic");

let url: string;
if (category) {
  url = `https://phimapi.com/v1/api/the-loai/${category}?page=${index}`;
} else if (topic) {
  url = `https://phimapi.com/v1/api/danh-sach/${topic}?page=${index}`;
} else {
  url = `https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=${index}`;
}
```

## Kết quả (Result)
✅ Query params hoạt động đúng trên homepage
✅ Thay đổi query params → nội dung trang cập nhật ngay lập tức
✅ Refresh trang → query params vẫn được giữ và áp dụng đúng
✅ Pagination giữ được category/topic filter khi chuyển trang
✅ Dropdown trong Header hiển thị đúng option đang được chọn
✅ SEO: Page title cũng được cập nhật dựa trên category/topic (đã có trong generateMetadata)

## Test Cases
1. **Default homepage**: `/?index=1` → Load phim mới cập nhật
2. **Category filter**: `/?category=hanh-dong` → Load phim hành động
3. **Topic filter**: `/?topic=phim-bo` → Load phim bộ
4. **Category + pagination**: `/?category=kinh-di&index=2` → Load phim kinh dị trang 2
5. **Topic + pagination**: `/?topic=phim-le&index=3` → Load phim lẻ trang 3
6. **Refresh**: Giữ nguyên filter sau khi refresh
7. **Dropdown selection**: Chọn category/topic từ dropdown → URL và content đều update

## API Endpoints được sử dụng
- Phim mới: `https://phimapi.com/danh-sach/phim-moi-cap-nhat?page={index}`
- Category: `https://phimapi.com/v1/api/the-loai/{category}?page={index}`
- Topic: `https://phimapi.com/v1/api/danh-sach/{topic}?page={index}`
