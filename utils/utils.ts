import { User } from '@prisma/client';
import validator from 'validator';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
/**
 * Purges sensitive user information from the given user object.
 * @param user - The user object to be purged.
 * @returns A new object with only the non-sensitive user information.
 */
export function purgeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
/**
 * Purges sensitive information from an Admin object.
 * @param user - The Admin object to purge.
 * @returns A new object with only the non-sensitive properties of the Admin object.
 */
export function purgeAdmin(user: User) {
  return {
    id: user.id,
    email: user.email,
  };
}

/* 
    Check if a password matches the following criterias:
    - Contains a special character
    - Contains a number
    - Has at least 6 characters
*/

export function isValidPassword(inputString: string) {
  // Check if it contains a special character
  const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(inputString);

  // Check if it contains a number
  const hasNumber = /\d/.test(inputString);

  // Check if it has at least 6 characters
  const hasMinimumLength = validator.isLength(inputString, { min: 6 });

  // Return true if all conditions are met
  return hasSpecialCharacter && hasNumber && hasMinimumLength;
}

/**
 * Hashes the given password using bcrypt.
 * @param password - The password to be hashed.
 * @returns The hashed password.
 */
export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10);
}

/**
 * Compares a plain text password with a hashed password.
 * @param password - The plain text password to compare.
 * @param hashedPassword - The hashed password to compare against.
 * @returns True if the passwords match, false otherwise.
 */
export function comparePassword(password: string, hashedPassword: string) {
  return bcrypt.compareSync(password, hashedPassword);
}

/**
 * Generates a JSON Web Token (JWT) with the provided user information.
 * @param {Object} options - The options for generating the JWT.
 * @param {string} options.userId - The user ID.
 * @param {boolean} options.role - Indicates if the user is an editor.
 * @param {boolean} options.isActive - Indicates if the user is active.
 * @returns {string} The generated JWT.
 * @throws {Error} If JWT_SECRET environment variable is not defined.
 */
export function generateJwt({
  userId,
  isAdmin,
  isVerified,
}: {
  userId: string;
  isAdmin: boolean;
  isVerified: boolean;
}) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not defined');
  const token = jwt.sign(
    { userId, isVerified, isAdmin },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d',
    },
  );
  return token;
}

/**
 * Verifies a JSON Web Token (JWT) using the provided token and JWT secret.
 * @param token - The JWT to be verified.
 * @returns The decoded payload if the token is valid, or null if the token is invalid.
 * @throws Error if the JWT_SECRET environment variable is not defined.
 */
export function verifyJwt(token: string): jwt.JwtPayload | null {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not defined');
  try {
    return jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Decodes a JSON Web Token (JWT).
 * @param token - The JWT to decode.
 * @returns The decoded JWT.
 */
export function decodeJwt(token: string) {
  return jwt.decode(token);
}


/**
 * Calculates the great-circle distance between two points on the Earth's surface.
 * @param coord1 - The first coordinate with latitude and longitude properties.
 * @param coord2 - The second coordinate with latitude and longitude properties.
 * @returns The distance between the two coordinates in kilometers.
 */
export function haversineDistance(coord1, coord2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const earthRadius = 6371;
  
    const lat1 = coord1.lat;
    const lon1 = coord1.lon;
    const lat2 = coord2.lat;
    const lon2 = coord2.lon;
  
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c; // Retourne la distance en km
  
    return distance;
}