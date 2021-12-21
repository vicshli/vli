import Document, { Html, Head, Main, NextScript } from "next/document";
import { StyledBody } from "../components/styled-body";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="true"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=PT+Serif&display=swap"
            rel="stylesheet"
          />
        </Head>
        <StyledBody>
          <Main />
          <NextScript />
        </StyledBody>
      </Html>
    );
  }
}

export default MyDocument;
