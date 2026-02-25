import axios from 'axios';
import express from "express";
import FormData from "form-data";
import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import Image from "../models/image.js";

import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads");

//  Correct absolute upload path
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// File filter to only allow JPG and PNG images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type.     Only JPG and PNG images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// POST image
router.post("/", (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      // Handle multer errors (file type, size, etc.)
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: "File is too large. Maximum size is 10MB." });
      }
      return res.status(400).json({ message: err.message || "File upload error" });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const image = new Image({
      filename: req.file.filename,
      path: `uploads/${req.file.filename}`,
    });

    await image.save();

    const formData = new FormData();
    formData.append("image", fs.createReadStream(path.join(uploadsDir, req.file.filename)), {
      filename: req.file.filename,
      contentType: req.file.mimetype,
    });

     const baseUrl = process.env.MODEL_API_URL;
     const response = await axios.post( `${baseUrl}/analyze` , formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    console.log("res from the model =>  ", response?.data)

    res.status(201).json({
      message: "Image uploaded & saved in images collection",
      image,
      predictionResult: response.data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Image upload failed" });
  }
});

export default router;
