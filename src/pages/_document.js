import React from 'react'
import getConfig from 'next/config'
import Document, { Html, Head, Main, NextScript } from 'next/document'
import createEmotionServer from '@emotion/server/create-instance'
import createEmotionCache from '../utils/createEmotionCache'
import theme from '../theme'

const config = getConfig().publicRuntimeConfig

export default class MyDocument extends Document {
    render() {
        return (
            <Html lang="en">
                <Head>
                    {/* PWA primary color */}
                    <meta
                        name="theme-color"
                        content={theme.palette.primary.main}
                    />
                    <meta
                        name="description"
                        content="The Open Science Workspace for Collaborative Data-driven Discovery"
                    ></meta>
                    <link
                        rel="stylesheet"
                        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
                    />
                    <link
                        rel="icon"
                        type="image/x-icon"
                        href="/icons/favicon.ico"
                    />

                    {/* Google Analytics */}
                    {config.GOOGLE_ANALYTICS_ID && (
                        <>
                            <script
                                async
                                src={`https://www.googletagmanager.com/gtag/js?id=${config.GOOGLE_ANALYTICS_ID}`}
                            />
                            <script
                                dangerouslySetInnerHTML={{
                                    __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${config.GOOGLE_ANALYTICS_ID}', {
                    page_path: window.location.pathname,
                  });
                  `,
                                }}
                            />
                        </>
                    )}

                    {/* Emotion style tags */}
                    {this.props.emotionStyleTags}
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

MyDocument.getInitialProps = async ctx => {
    const originalRenderPage = ctx.renderPage

    // Create cache for Emotion
    const cache = createEmotionCache()
    const { extractCriticalToChunks } = createEmotionServer(cache)

    // Enhance app to use the same cache
    ctx.renderPage = () =>
        originalRenderPage({
            enhanceApp: App => props => <App emotionCache={cache} {...props} />,
        })

    const initialProps = await Document.getInitialProps(ctx)

    // Extract styles
    const emotionStyles = extractCriticalToChunks(initialProps.html)
    const emotionStyleTags = emotionStyles.styles.map(style => (
        <style
            data-emotion={`${style.key} ${style.ids.join(' ')}`}
            key={style.key}
            dangerouslySetInnerHTML={{ __html: style.css }}
        />
    ))

    return {
        ...initialProps,
        styles: [
            ...React.Children.toArray(initialProps.styles),
            ...emotionStyleTags,
        ],
    }
}
