import React from 'react';
import Head from 'next/head';
import * as Sentry from "@sentry/react";
import { ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import createEmotionCache from '../utils/createEmotionCache';
import theme from '../theme';
import { APIProvider } from '../contexts/api';
import { UserProvider } from '../contexts/user';
import { ErrorProvider } from '../contexts/error';
import { SuccessProvider } from '../contexts/success';
import Custom404 from './404';
import Custom500 from './500';
import getConfig from 'next/config';

// Client-side cache, shared for the whole session
const clientSideEmotionCache = createEmotionCache();

// Get runtime config from next.config.js
const nextConfig = getConfig();
const { publicRuntimeConfig } = nextConfig || { publicRuntimeConfig: {} };

// From https://github.com/vercel/next.js/blob/canary/examples/with-google-analytics/pages/_document.js
export function reportWebVitals({ id, name, label, value }) {
  if (window.gtag)
    window.gtag('event', name, {
      event_category:
        label === 'web-vital' ? 'Web Vitals' : 'Next.js custom metric',
      value: Math.round(name === 'CLS' ? value * 1000 : value), // values must be integers
      event_label: id, // id unique to current page load
      non_interaction: true, // avoids affecting bounce rate
    });
}

function MyApp(props) {
  const { 
    Component, 
    emotionCache = clientSideEmotionCache, 
    pageProps, 
    kauth, 
    user, 
    baseUrl, 
    token 
  } = props;

  // Added to handle errors from API during SSR
  if (pageProps.error) {
    console.log('Error in getServerSideProps:', pageProps.error);
    if (pageProps.error.statusCode == 404)
      return <Custom404 />;
    else
      return <Custom500 />;
  }

  React.useEffect(() => {
    // Initialize Sentry on client side only
    if (publicRuntimeConfig.SENTRY_DSN) {
      Sentry.init({ 
        dsn: publicRuntimeConfig.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development'
      });
    }

    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <CacheProvider value={emotionCache}>
      <Sentry.ErrorBoundary fallback={"An error has occurred"}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <APIProvider baseUrl={baseUrl} token={token}>
            <UserProvider user={user}>
              <Head>
                <title>User Portal - CyVerse</title>
                <meta name="viewport" content="initial-scale=1, width=device-width" />
              </Head>
              <ErrorProvider>
                <SuccessProvider>
                  <Component {...pageProps} />
                </SuccessProvider>
              </ErrorProvider>
            </UserProvider>
          </APIProvider>
        </ThemeProvider>
      </Sentry.ErrorBoundary>
    </CacheProvider>
  );
}

export default MyApp;

MyApp.getInitialProps = async ({ Component, ctx }) => {
  const req = ctx.req;
  const api = req && req.api;
  return {
    kauth: req && req.kauth,
    baseUrl: api && api.baseUrl, 
    token: api && api.token,
    user: api && api.token ? await api.user() : null,
    pageProps: Component.getInitialProps ? await Component.getInitialProps(ctx) : {},
  };
};