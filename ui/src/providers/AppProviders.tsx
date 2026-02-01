import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthProvider } from 'react-oidc-context';
import type { PropsWithChildren } from 'react';

const theme = createTheme();

const cognitoAuthConfig = {
  authority: import.meta.env.VITE_COGNITO_AUTHORITY,
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
  response_type: import.meta.env.VITE_COGNITO_RESPONSE_TYPE,
  scope: import.meta.env.VITE_COGNITO_SCOPE,
};

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <AuthProvider {...cognitoAuthConfig}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </AuthProvider>
  );
}
