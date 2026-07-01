export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePassword = (password) => password.length >= 6;

export const validateName = (name) => name.trim().length >= 2;

export const validateTaskTitle = (title) => title.trim().length > 0;
