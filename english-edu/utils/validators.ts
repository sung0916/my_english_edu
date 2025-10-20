export const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

export const validatePassword = (password: string): boolean => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,15}$/;
    return regex.test(password);
};

export const validatePhoneNumber = (tel: string): boolean => {
  const regex = /^[0-9-]+$/;
  return regex.test(tel);
};

export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};