import { ScrollViewStyleReset } from 'expo-router/html';

  export default function Root({ children }) {
    return (
      <html lang="ko">
        <head>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
          <link rel="icon" href="/favicon.png" />
          <ScrollViewStyleReset />
          <link rel="stylesheet" href="https://unpkg.com/react-quill@2.0.0/dist/quill.snow.css" />
        </head>
        <body>{children}</body>
      </html>
    );
  }
  