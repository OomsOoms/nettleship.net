const bcryptjs = require("bcryptjs");
const {
  hashPassword,
  comparePasswords,
} = require("../../../src/api/helpers/passwordHasher");

jest.mock("bcryptjs"); // Mock bcryptjs module

describe("hashPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should hash the password successfully", async () => {
    const password = "securePassword";
    const expectedHash = "hashedPassword";

    // Mock the bcryptjs.hash function to return the expected hash
    bcryptjs.hash.mockResolvedValue(expectedHash);

    const hashedPassword = await hashPassword(password);
    // Check if the hashed password is the expected hash
    expect(hashedPassword).toBe(expectedHash);
    // Check if bcryptjs.hash was called with the correct arguments, this is only done on mock functions
    expect(bcryptjs.hash).toHaveBeenCalledWith(password, expect.any(Number));
  });

  it("should throw an error if hashing fails", async () => {
    const password = "securePassword";
    const error = new Error("Hashing failed");

    bcryptjs.hash.mockRejectedValue(error);

    await expect(hashPassword(password)).rejects.toThrow(error);

    expect(bcryptjs.hash).toHaveBeenCalledWith(password, expect.any(Number));
  });
});

describe("comparePasswords", () => {
  const plainPassword = "password123";
  const hashedPassword = "$2a$10$somehashedpasswordstring";

  beforeEach(() => {
    jest.resetAllMocks(); // Reset all mocked functions before each test
  });

  it("should return true when passwords match", async () => {
    bcryptjs.compare.mockResolvedValue(true); // Mock bcryptjs.compare to resolve with true

    const result = await comparePasswords(plainPassword, hashedPassword);

    expect(result).toBe(true);
    expect(bcryptjs.compare).toHaveBeenCalledWith(
      plainPassword,
      hashedPassword
    );
  });

  it("should return false when passwords do not match", async () => {
    bcryptjs.compare.mockResolvedValue(false); // Mock bcryptjs.compare to resolve with false

    const result = await comparePasswords(plainPassword, hashedPassword);

    expect(result).toBe(false);
    expect(bcryptjs.compare).toHaveBeenCalledWith(
      plainPassword,
      hashedPassword
    );
  });

  it("should throw an error if bcryptjs.compare throws an error", async () => {
    const error = new Error("bcrypt comparison error");
    bcryptjs.compare.mockRejectedValue(error); // Mock bcryptjs.compare to reject with an error

    // Ensure the function throws the same error
    await expect(
      comparePasswords(plainPassword, hashedPassword)
    ).rejects.toThrow(error);
    expect(bcryptjs.compare).toHaveBeenCalledWith(
      plainPassword,
      hashedPassword
    );
  });

  // Add more test cases as needed to cover edge cases and scenarios
});
