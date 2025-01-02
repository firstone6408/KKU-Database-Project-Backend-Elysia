/** @format */

import path from "path";
import fs from "fs";
import sharp from "sharp";

export class ImageFileHandler
{
    private readonly uploadDir: string;
    private readonly folderName: string;

    constructor(folderName: string)
    {
        this.uploadDir = path.join(
            process.cwd(),
            "public",
            "uploads",
            folderName
        );
        this.folderName = folderName;

        //console.log("Dir:", this.uploadDir);

        if (!fs.existsSync(this.uploadDir))
        {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    public async saveFile(file: File)
    {
        try
        {
            if (!file)
            {
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
        } catch (error)
        {
            console.error("Error saving file:", error);
            throw new Error("Failed to save the file.");
        }
    }

    public async updateFile(oldFileName: string, newFile: File)
    {
        try
        {
            this.deleteFile(oldFileName);
            return await this.saveFile(newFile);
        } catch (error)
        {
            console.error("Error updating file:", error);
            throw new Error("Failed to update the file.");
        }
    }

    public deleteFile(fileName: string)
    {
        try
        {
            if (
                !fileName ||
                typeof fileName !== "string" ||
                fileName.trim() === ""
            )
            {
                console.error("Invalid file name provided.");
                return false;
            }
            const cleanedFileName = path.basename(fileName);
            const filePath = path.join(this.uploadDir, cleanedFileName);
            if (fs.existsSync(filePath))
            {
                fs.unlinkSync(filePath);
                return true;
            }
            return false;
        } catch (error)
        {
            console.error("Error deleting file:", error);
            return false;
        }
    }
}
