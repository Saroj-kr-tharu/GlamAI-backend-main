import Image from "../../models/image.js";

describe("Image model", () => {
  it("should have the correct schema fields", () => {
    const schemaPaths = Image.schema.paths;

    expect(schemaPaths.filename).toBeDefined();
    expect(schemaPaths.filename.options.type).toBe(String);
    expect(schemaPaths.filename.options.required).toBe(true);

    expect(schemaPaths.path).toBeDefined();
    expect(schemaPaths.path.options.type).toBe(String);
    expect(schemaPaths.path.options.required).toBe(true);

    expect(schemaPaths.uploadedAt).toBeDefined();
    expect(schemaPaths.uploadedAt.options.type).toBe(Date);
  });

  it("should use 'images' as the collection name", () => {
    expect(Image.collection.collectionName).toBe("images");
  });

  it("should set default uploadedAt to current date", () => {
    const image = new Image({
      filename: "test.jpg",
      path: "uploads/test.jpg",
    });

    expect(image.uploadedAt).toBeInstanceOf(Date);
  });
});
