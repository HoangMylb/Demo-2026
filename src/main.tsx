import React from 'react';
import ReactDOM from 'react-dom/client';
import { App as AntApp, ConfigProvider } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import 'antd/dist/reset.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: 'var(--color-brand-600)',
          colorBgBase: 'var(--color-bg-surface)',
          colorTextBase: 'var(--color-text-primary)',
          colorText: 'var(--color-text-primary)',
          colorTextSecondary: 'var(--color-text-secondary)',
          colorBorder: 'var(--color-border-soft)',
          colorBgContainer: 'var(--color-bg-surface)',
          borderRadius: 16,
          fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>,
);
