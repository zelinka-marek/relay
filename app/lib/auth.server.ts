import crypto from "crypto";

export async function hash(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // generate random 16 bytes long salt
    const salt = crypto.randomBytes(16).toString("hex");

    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) {
        reject(error);
      }

      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

export async function verify(
  password: string,
  hashed: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hashed.split(":");

    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) {
        reject(error);
      }

      resolve(key === derivedKey.toString("hex"));
    });
  });
}
