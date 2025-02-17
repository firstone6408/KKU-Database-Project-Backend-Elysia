/** @format */

import path from "path";
import fs from "fs";
import sharp from "sharp";

/**
 * ImageFileHandler - A utility class for handling image uploads, replacements, and deletions.
 * It automatically resizes images and saves them to a specified folder.
 *
 * ## Example Usage:
 * ```typescript
 * // Ensure you have installed the required dependencies:
 * // npm install sharp
 *
 * import { ImageFileHandler } from "./ImageFileHandler";
 *
 * async function main() {
 *   const imageHandler = new ImageFileHandler("products");
 *
 *   // Simulated File object (normally comes from form-data in an API)
 *   const file = new File([Buffer.from("sample image data")], "image.jpg", { type: "image/jpeg" });
 *
 *   // Upload the file
 *   const uploadedPath = await imageHandler.uploadFile(file);
 *   console.log("Uploaded file at:", uploadedPath);
 *
 *   // Replace an existing file
 *   const replacedPath = await imageHandler.replaceFile("old-image.jpg", file);
 *   console.log("Replaced file at:", replacedPath);
 *
 *   // Delete the file
 *   const deleted = imageHandler.deleteFileByName("old-image.jpg");
 *   console.log("File deleted:", deleted);
 * }
 *
 * main().catch(console.error);
 * ```
 */
export class ImageFileHandler {
  private readonly uploadDir: string;
  private readonly folderName: string;

  /**
   * Constructor to initialize the upload directory.
   * @param folderName - The folder where the images will be stored.
   *
   * ## Example Usage:
   * ```typescript
   * const imageHandler = new ImageFileHandler("products");
   * ```
   */
  constructor(folderName: string) {
    this.uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      folderName
    );
    this.folderName = folderName;

    //console.log("Dir:", this.uploadDir);

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Uploads a file, resizes it, and saves it to the server.
   * @param file - The uploaded file (must be of type File).
   * @returns The relative URL path of the uploaded file.
   * @throws Error if the file is invalid or cannot be saved.
   *
   * ## Example Usage:
   * ```typescript
   * const uploadedPath = await imageHandler.uploadFile(file);
   * console.log("Uploaded file path:", uploadedPath);
   * ```
   */
  public async uploadFile(file: File) {
    try {
      if (!file) {
        throw new Error("Invalid file object");
      }

      const fileBuffer = Buffer.from(await file.arrayBuffer());

      const uniqueSuffix = `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}`;
      const newFileName = `${uniqueSuffix}.jpg`;
      const filePath = path.join(this.uploadDir, newFileName);

      await sharp(fileBuffer)
        .resize({ width: 800, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(filePath);

      // console.log("filePath:", filePath);

      // const newPath =
      //   "/" +
      //   path.relative(path.join(__dirname), filePath).replace(/\\+/g, "/");

      // return newPath;

      const relativePath = `/public/uploads/${this.folderName}/${newFileName}`;

      return relativePath;
    } catch (error) {
      console.error("Error saving file:", error);
      throw new Error("Failed to save the file.");
    }
  }

  /**
   * Replaces an existing file by deleting the old file and uploading a new one.
   * @param oldFilePath - The path of the existing file to be replaced.
   * @param newFile - The new uploaded file.
   * @returns The relative URL path of the new file.
   * @throws Error if the replacement fails.
   *
   * ## Example Usage:
   * ```typescript
   * const replacedPath = await imageHandler.replaceFile("old-image.jpg", file);
   * console.log("Replaced file path:", replacedPath);
   * ```
   */
  public async replaceFile(oldFilePath: string, newFile: File) {
    try {
      this.deleteFile(oldFilePath);
      return await this.uploadFile(newFile);
    } catch (error) {
      console.error("Error updating file:", error);
      throw new Error("Failed to update the file.");
    }
  }

  /**
   * Deletes an existing file from the upload directory.
   * @param filePath - The name of the file to be deleted.
   * @returns `true` if the file was deleted successfully, `false` otherwise.
   *
   * ## Example Usage:
   * ```typescript
   * const deleted = imageHandler.deleteFile("old-image.jpg");
   * console.log("File deleted:", deleted);
   * ```
   */
  public deleteFile(filePath: string) {
    try {
      if (
        !filePath ||
        typeof filePath !== "string" ||
        filePath.trim() === ""
      ) {
        console.error("Invalid file path provided.");
        return false;
      }

      const cleanedFileName = path.basename(filePath);
      // console.log("cleanedFileName:", cleanedFileName);

      const targetFilePath = path.join(this.uploadDir, cleanedFileName);
      // console.log("targetFilePath:", targetFilePath);
      if (fs.existsSync(targetFilePath)) {
        fs.unlinkSync(targetFilePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }
}
