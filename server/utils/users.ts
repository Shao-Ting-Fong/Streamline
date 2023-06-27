interface User {
  id: string;
  username: string;
  room: string;
}

const users: User[] = [];

// Join user to chat
export function userJoin(user: User) {
  users.push(user);
  return user;
}

// Get current user
export function getCurrentUser(id: string) {
  return users.find((user) => user.id === id);
}

export function getRoomUsers(room: string) {
  return users.filter((user) => user.room === room);
}

export function userLeave(id: string) {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) return users.splice(index, 1)[0];
  return undefined;
}
