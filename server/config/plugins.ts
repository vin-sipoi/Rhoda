module.exports = ({ env }) => ({
  email: {
    config: {
      provider: "sendgrid",
      providerOptions: {
        apiKey: env("SENDGRID_API_KEY"), // Required
      },
      settings: {
        defaultFrom: env("SENDGRID_EMAIL"),
        defaultReplyTo: env("SENDGRID_EMAIL"),
      },
    },
  },

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