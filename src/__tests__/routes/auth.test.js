import express from "express";
import http from "http";
import jwt from "jsonwebtoken";
import User from "../../models/user.js";
import authRoutes from "../../routes/auth.js";

jest.mock("jsonwebtoken");
jest.mock("../../models/user.js", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  },
}));
jest.mock("../../middleware/auth.js", () => ({
  __esModule: true,
  protect: jest.fn((req, res, next) => {
    req.user = { _id: "user123", username: "testuser", email: "test@test.com" };
    next();
  }),
}));

function makeRequest(server, method, path, body = null) {
  const { port } = server.address();
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) options.body = JSON.stringify(body);
  return fetch(`http://localhost:${port}${path}`, options).then(async (res) => ({
    status: res.status,
    body: await res.json(),
  }));
}

describe("Auth Routes", () => {
  let app, server;

  beforeAll((done) => {
    process.env.JWT_SECRET = "test-secret";
    app = express();
    app.use(express.json());
    app.use("/api/auth", authRoutes);
    server = http.createServer(app);
    server.listen(0, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    jwt.sign.mockReturnValue("mock-jwt-token");
  });

  describe("POST /api/auth/register", () => {
    it("should return 400 if fields are missing", async () => {
      const res = await makeRequest(server, "POST", "/api/auth/register", {
        username: "testuser",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("All fields are required");
    });

    it("should return 400 if user already exists", async () => {
      User.findOne.mockResolvedValue({ _id: "existing", email: "test@test.com" });

      const res = await makeRequest(server, "POST", "/api/auth/register", {
        username: "testuser",
        email: "test@test.com",
        password: "password123",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("User already exists");
    });

    it("should return 201 and token on successful registration", async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        _id: "newuser123",
        username: "testuser",
        email: "test@test.com",
      });

      const res = await makeRequest(server, "POST", "/api/auth/register", {
        username: "testuser",
        email: "test@test.com",
        password: "password123",
      });

      expect(res.status).toBe(201);
      expect(res.body.token).toBe("mock-jwt-token");
      expect(res.body.user.name).toBe("testuser");
      expect(res.body.user.email).toBe("test@test.com");
    });

    it("should return 500 on server error", async () => {
      User.findOne.mockRejectedValue(new Error("DB error"));

      const res = await makeRequest(server, "POST", "/api/auth/register", {
        username: "testuser",
        email: "test@test.com",
        password: "password123",
      });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("DB error");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should return 400 if fields are missing", async () => {
      const res = await makeRequest(server, "POST", "/api/auth/login", {
        email: "test@test.com",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("All fields are required");
    });

    it("should return 401 for invalid credentials", async () => {
      User.findOne.mockResolvedValue(null);

      const res = await makeRequest(server, "POST", "/api/auth/login", {
        email: "test@test.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid email or password");
    });

    it("should return 401 if password does not match", async () => {
      User.findOne.mockResolvedValue({
        _id: "user123",
        username: "testuser",
        email: "test@test.com",
        matchPassword: jest.fn().mockResolvedValue(false),
      });

      const res = await makeRequest(server, "POST", "/api/auth/login", {
        email: "test@test.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid email or password");
    });

    it("should return 200 and token on successful login", async () => {
      User.findOne.mockResolvedValue({
        _id: "user123",
        username: "testuser",
        email: "test@test.com",
        matchPassword: jest.fn().mockResolvedValue(true),
      });

      const res = await makeRequest(server, "POST", "/api/auth/login", {
        email: "test@test.com",
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body.token).toBe("mock-jwt-token");
      expect(res.body.user.name).toBe("testuser");
    });

    it("should return 500 on server error", async () => {
      User.findOne.mockRejectedValue(new Error("DB error"));

      const res = await makeRequest(server, "POST", "/api/auth/login", {
        email: "test@test.com",
        password: "password123",
      });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("DB error");
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return the current user", async () => {
      const res = await makeRequest(server, "GET", "/api/auth/me");

      expect(res.status).toBe(200);
      expect(res.body.username).toBe("testuser");
      expect(res.body.email).toBe("test@test.com");
    });
  });
});
