import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Switch } from 'antd';
import { useThemeStore } from '../../stores/theme-store';

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDark = theme === 'dark';

  return (
    <Switch
      onClick={toggleTheme}
      aria-label="Toggle theme"
      checked={isDark}
      checkedChildren={<MoonOutlined />}
      unCheckedChildren={<SunOutlined />}
      style={{ background: isDark ? 'var(--color-brand-600)' : 'var(--color-border-strong)' }}
    />
  );
}
