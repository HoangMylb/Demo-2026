import { Card, Input, Segmented, Space, Typography } from 'antd';

export const productCategories = ['All', 'Audio', 'Wearables', 'Workspace', 'Accessories'] as const;
export type ProductCategoryFilter = (typeof productCategories)[number];

interface ProductFiltersProps {
  search: string;
  selectedCategory: ProductCategoryFilter;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: ProductCategoryFilter) => void;
}

export function ProductFilters({ search, selectedCategory, onSearchChange, onCategoryChange }: ProductFiltersProps) {
  return (
    <Card bordered={false} style={{ marginBottom: 32, boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)' }}>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Refine products
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ margin: '8px 0 0' }}>
            Use standard search and category controls instead of custom filter widgets.
          </Typography.Paragraph>
        </div>

        <Input.Search
          allowClear
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search products, materials, or categories"
          size="large"
        />

        <Segmented<ProductCategoryFilter>
          block
          options={productCategories.map((category) => ({ label: category, value: category }))}
          value={selectedCategory}
          onChange={(value) => onCategoryChange(value)}
        />
      </Space>
    </Card>
  );
}
