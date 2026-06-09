const validateRegister = (data) => {
  const { name, email, password } = data;
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return 'Name must be at least 2 characters long.';
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return 'Please provide a valid email address.';
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return 'Password must be at least 6 characters long.';
  }
  return null;
};

const validateLogin = (data) => {
  const { email, password } = data;
  if (!email || typeof email !== 'string') {
    return 'Email is required.';
  }
  if (!password || typeof password !== 'string') {
    return 'Password is required.';
  }
  return null;
};

module.exports = {
  validateRegister,
  validateLogin
};
