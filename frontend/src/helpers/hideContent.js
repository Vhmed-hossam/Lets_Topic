export const HideEmail = (email) => {
    const [user, domain] = email.split("@");
    const hiddenUser = "*".repeat(user.length);
    return `${hiddenUser}@${domain}`;
  };
  