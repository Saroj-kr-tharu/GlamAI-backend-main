import jwt from "jsonwebtoken";
import User from "../../models/user.js";
import { protect } from "../../middleware/auth.js";

jest.mock("jsonwebtoken");
jest.mock("../../models/user.js", () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

describe("protect middleware", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it("should return 401 if no authorization header is provided", async () => {
    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Not authorized, token failed" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if authorization header does not start with Bearer", async () => {
    req.headers.authorization = "Basic sometoken";

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if token verification fails", async () => {
    req.headers.authorization = "Bearer invalidtoken";
    jwt.verify.mockImplementation(() => {
      throw new Error("jwt malformed");
    });

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Not authorized, token failed" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should set req.user and call next on valid token", async () => {
    req.headers.authorization = "Bearer validtoken";
    jwt.verify.mockReturnValue({ id: "user123" });

    const mockUser = { _id: "user123", username: "testuser", email: "test@test.com" };
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    await protect(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("validtoken", "test-secret");
    expect(User.findById).toHaveBeenCalledWith("user123");
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  });
});
