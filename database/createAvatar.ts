const createColor = (): string => {
  let red: Number = Math.floor(Math.random() * 256);
  let green: Number = Math.floor(Math.random() * 256);
  let blue:Number = Math.floor(Math.random() * 256);

  let toHex = (value:Number) => value.toString(16).padStart(2, "0");

  let color = `#${toHex(red)}${toHex(green)}${toHex(blue)}`;

  return color;
};

const getInitials = (name: string): string => {
  let initials = name
    .split(" ")
    .map((w) => w.slice(0, 1).toUpperCase())
    .join("");

  return initials;
};

export { createColor, getInitials };
