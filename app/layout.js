import './globals.css';

export const metadata = {
  title: '数字员工 · 阿文｜公众号运营专员',
  description: '每天交付 1 篇排版成稿：标题、头图、金句卡、摘要齐活，复制即贴进公众号后台。',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.loli.net" />
        <link rel="preconnect" href="https://gstatic.loli.net" crossOrigin="anonymous" />
        <link
          href="https://fonts.loli.net/css2?family=Noto+Sans+SC:wght@400;500;700;900&family=Noto+Serif+SC:wght@700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
