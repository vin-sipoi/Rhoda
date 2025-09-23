module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      providers: {
        google: {
          clientId: env('GOOGLE_CLIENT_ID'),
          clientSecret: env('GOOGLE_CLIENT_SECRET'),
          redirectUri: 'http://localhost:1337/api/connect/google/callback',
        },
      },
    },
  },
});