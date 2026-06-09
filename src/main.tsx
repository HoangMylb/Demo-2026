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
          colorBgElevated: 'var(--color-bg-surface)',
          colorTextLightSolid: '#ffffff',
          borderRadius: 16,
          fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
        components: {
          Layout: {
            headerBg: 'transparent',
            siderBg: 'transparent',
            bodyBg: 'transparent',
          },
          Menu: {
            itemBg: 'transparent',
            subMenuItemBg: 'transparent',
            itemColor: 'var(--color-text-primary)',
            itemHoverColor: 'var(--color-text-primary)',
            itemHoverBg: 'var(--color-bg-surface)',
            itemSelectedColor: 'var(--color-text-primary)',
            itemSelectedBg: 'var(--color-bg-surface)',
            itemActiveBg: 'var(--color-bg-surface)',
            activeBarBorderWidth: 0,
          },
          Dropdown: {
            colorBgElevated: 'var(--color-bg-surface)',
            colorText: 'var(--color-text-primary)',
            colorTextHeading: 'var(--color-text-primary)',
          },
          Table: {
            headerBg: 'var(--color-bg-surface)',
            headerColor: 'var(--color-text-primary)',
            headerSplitColor: 'var(--color-border-soft)',
            rowHoverBg: 'var(--color-bg-surface-soft)',
            borderColor: 'var(--color-border-soft)',
            colorBgContainer: 'var(--color-bg-surface)',
            colorText: 'var(--color-text-primary)',
          },
          Modal: {
            contentBg: 'var(--color-bg-surface)',
            headerBg: 'var(--color-bg-surface)',
            titleColor: 'var(--color-text-primary)',
            colorText: 'var(--color-text-primary)',
            colorIcon: 'var(--color-text-secondary)',
          },
          Card: {
            colorBgContainer: 'var(--color-bg-surface)',
            colorTextHeading: 'var(--color-text-primary)',
          },
          Input: {
            colorBgContainer: 'var(--color-bg-surface)',
            colorText: 'var(--color-text-primary)',
            colorIcon: 'var(--color-text-secondary)',
            activeBorderColor: 'var(--color-brand-600)',
            hoverBorderColor: 'var(--color-border-strong)',
          },
          InputNumber: {
            colorBgContainer: 'var(--color-bg-surface)',
            colorText: 'var(--color-text-primary)',
            activeBorderColor: 'var(--color-brand-600)',
            hoverBorderColor: 'var(--color-border-strong)',
          },
          Select: {
            colorBgContainer: 'var(--color-bg-surface)',
            colorText: 'var(--color-text-primary)',
            colorTextPlaceholder: 'var(--color-text-muted)',
            optionSelectedBg: 'var(--color-bg-surface-soft)',
            optionActiveBg: 'var(--color-bg-surface-soft)',
            optionSelectedColor: 'var(--color-text-primary)',
          },
          Button: {
            defaultBg: 'var(--color-button-default-bg)',
            defaultColor: 'var(--color-button-default-text)',
            defaultBorderColor: 'var(--color-border-soft)',
            defaultHoverBg: 'var(--color-bg-surface-soft)',
            defaultHoverColor: 'var(--color-text-primary)',
            defaultHoverBorderColor: 'var(--color-border-strong)',
            primaryColor: '#ffffff',
            dangerColor: '#ffffff',
            colorPrimaryHover: 'var(--color-brand-700)',
            colorPrimaryActive: 'var(--color-brand-700)',
          },
          Popconfirm: {
            colorText: 'var(--color-text-primary)',
          },
          Tag: {
            defaultColor: 'var(--color-text-primary)',
            defaultBg: 'var(--color-bg-surface-soft)',
          },
          Drawer: {
            colorBgElevated: 'var(--color-bg-surface)',
            colorText: 'var(--color-text-primary)',
            colorTextHeading: 'var(--color-text-primary)',
          },
        },
      }}
    >
      <AntApp>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <App />
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>,
);
