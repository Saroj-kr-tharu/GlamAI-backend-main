import mongoose from "mongoose";
import { connectDB } from "../../config/db.js";

jest.mock("mongoose");

describe("connectDB", () => {
  const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {});
  const mockConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MONGO_URI = "mongodb://localhost/test";
  });

  afterAll(() => {
    mockExit.mockRestore();
    mockConsoleLog.mockRestore();
  });

  it("should connect to MongoDB successfully", async () => {
    mongoose.connect.mockResolvedValue({
      connection: { host: "localhost" },
    });

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith("mongodb://localhost/test");
    expect(mockConsoleLog).toHaveBeenCalledWith("MongoDB connected localhost");
  });

  it("should call process.exit(1) on connection failure", async () => {
    const error = new Error("Connection failed");
    mongoose.connect.mockRejectedValue(error);

    await connectDB();

    expect(mockConsoleLog).toHaveBeenCalledWith(error);
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
