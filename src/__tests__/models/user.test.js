import bcrypt from "bcryptjs";
import User from "../../models/user.js";

jest.mock("bcryptjs");

describe("User model", () => {
  it("should have the correct schema fields", () => {
    const schemaPaths = User.schema.paths;

    expect(schemaPaths.username).toBeDefined();
    expect(schemaPaths.username.options.type).toBe(String);
    expect(schemaPaths.username.options.required).toBe(true);
    expect(schemaPaths.username.options.unique).toBe(true);

    expect(schemaPaths.email).toBeDefined();
    expect(schemaPaths.email.options.type).toBe(String);
    expect(schemaPaths.email.options.required).toBe(true);
    expect(schemaPaths.email.options.unique).toBe(true);

    expect(schemaPaths.password).toBeDefined();
    expect(schemaPaths.password.options.type).toBe(String);
    expect(schemaPaths.password.options.required).toBe(true);
  });

  it("should have timestamps enabled", () => {
    expect(User.schema.options.timestamps).toBe(true);
  });

  it("matchPassword should compare passwords using bcrypt", async () => {
    bcrypt.compare.mockResolvedValue(true);

    const user = new User({
      username: "testuser",
      email: "test@test.com",
      password: "hashedpassword123",
    });

    const result = await user.matchPassword("plaintextpassword");

    expect(bcrypt.compare).toHaveBeenCalledWith("plaintextpassword", "hashedpassword123");
    expect(result).toBe(true);
  });

  it("matchPassword should return false for wrong password", async () => {
    bcrypt.compare.mockResolvedValue(false);

    const user = new User({
      username: "testuser",
      email: "test@test.com",
      password: "hashedpassword123",
    });

    const result = await user.matchPassword("wrongpassword");

    expect(bcrypt.compare).toHaveBeenCalledWith("wrongpassword", "hashedpassword123");
    expect(result).toBe(false);
  });
});
