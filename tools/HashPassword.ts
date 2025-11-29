import bcrypt from "bcryptjs";
import { createInterface } from "readline";

const readInterface = createInterface({
  input: process.stdin,
  output: process.stdout,
});

readInterface.question("Enter password to hash: ", async (password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Hashed Password:", hashedPassword);
  readInterface.close();
});
