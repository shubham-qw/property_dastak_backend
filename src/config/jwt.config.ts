export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  signOptions: {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h', // Token expires in 24 hours
  },
};

