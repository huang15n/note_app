import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret_change_me', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

export default generateToken;
