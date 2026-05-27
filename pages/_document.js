import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Teacho — the first decentralized education platform where ETHx streams directly from student to teacher in real time. Pay only for the seconds you learn."
        />
        <meta name="theme-color" content="#000000" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Teacho · Pay Per Second Learning" />
        <meta
          property="og:description"
          content="The first decentralized education platform where ETHx streams directly from student to teacher in real time. Pay only for the seconds you learn."
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Teacho · Pay Per Second Learning" />
        <meta
          name="twitter:description"
          content="Pay only for the seconds you learn. Powered by Superfluid on Base Sepolia."
        />

        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
