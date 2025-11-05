import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* 
          ✅✅✅ 가장 중요한 부분 ✅✅✅
          CDN을 통해 react-quill의 CSS 파일을 직접 불러옵니다.
          Metro가 이 파일을 건드리지 않으므로, 더 이상 번들링 에러가 발생하지 않습니다.
        */}
        <link rel="stylesheet" href="https://unpkg.com/react-quill@1.3.3/dist/quill.snow.css" />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
