import express from "express";
const router = express.Router();
import multer from "multer";
const uploadforDrive = multer();
import fs from "fs";
import { BlogsModel, testimonial, Gallery } from "../../index.js";
import { drive } from '../../Private/APIs/AdminRouter.js'
import { Id_for_Blogs, Id_for_Gallery } from '../../Private/SECRET/Auth-data.js'
import jwt from "jsonwebtoken";
const JWT_SECRET = "ankitPatel12345";
import stream from 'stream';
import { randomBytes } from "crypto";

const assignToken = (userId) => {
    const token = jwt.sign({ userId }, JWT_SECRET);
    return token;
};

const storage = multer.memoryStorage();
const upload = multer({ "storage": storage })
const uploadForDrive = multer();
const uploadGalleryInDrive = multer({ storage: storage });

const isAuthenticated = (req, res, next) => {
    const token = req.cookies.adminToken;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Missing token, Please login again' });
    }
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error(error)
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });

    }
};

router.get("/Educationpage", async (req, res) => {
    try {
        res.render("./EducationFolder/Educationpage.ejs")
    } catch (error) {
        console.error(error)
    }
});

router.get("/skills", async (req, res) => {
    try {
        res.render("./EducationFolder/Skills.ejs");
    }
    catch (error) {
        console.error(error)
        res.send(error);
    }
});

router.get("/resume", async (req, res) => {
    try {
        res.render("./EducationFolder/Resume.ejs")
    } catch (error) {

    }
});

router.get("/blog", async (req, res) => {
    try {
        res.render("./Blogs/blog.ejs");
    } catch (error) {
        console.error(error)
        res.send(error);
    }
});

router.get("/showBlogs", async (req, res) => {
    try {
        const blogsData = await BlogsModel.find();
        if (blogsData) {
            // Convert Binary data to base64
            const blogsWithBase64Image = blogsData.map(blog => {
                if (blog.image && blog.image.buffer) {
                    const base64Image = Buffer.from(blog.image.buffer).toString('base64');
                    return { ...blog.toObject(), image: base64Image };
                }
                return blog;
            });

            res.status(200).json({ blogsData: blogsWithBase64Image });
        } else {
            res.status(404).json({ message: "Not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error });
    }
});

router.get("/addBlogs", isAuthenticated, async (req, res) => {
    try {
        res.render("./Blogs/addBlogs.ejs");
    } catch (error) {
        console.error(error)
        res.send(error);
    }
});


router.post("/addInformation", isAuthenticated, uploadforDrive.single('image'), async (req, res) => {
    try {
        const { title, content, category, date, location, photos, hashtags, codes } = req.body;

        let fileId = null;
        if (req.file) {
            fileId = await uploadFileToDrive(req.file);
        }
       console.log(fileId) 
        const parsedPhotos = photos ? photos.split(',') : [];
        const parsedHashtags = hashtags ? hashtags.split(',') : [];

        const newBlog = new BlogsModel({
            title,
            content,
            category,
            date,
            location,
            photos: parsedPhotos,
            hashtags: parsedHashtags,
            codes,
            filename: req.file ? req.file.originalname : null,
            mimetype: req.file ? req.file.mimetype : null,
            fileId: fileId
        });

        await newBlog.save();

        res.json({ success: true, message: 'Information added successfully.' });
    } catch (error) {
        console.error('Error adding information:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

// console.log(Id_for_Blogs)  
async function uploadFileToDrive(fileObject) {
    try {
       
        const bufferStream = new stream.PassThrough();
        bufferStream.end(fileObject.buffer);

        const { data } = await drive.files.create({
            requestBody: {
                name: fileObject.originalname,
                parents: [Id_for_Blogs],
            },
            media: {
                mimeType: fileObject.mimetype,
                body: bufferStream,
            },
        });
        console.log(data)
        console.log(`Uploaded file ${data.name} (${data.id})`);
        return data.id;
    } catch (error) {
        console.error("Error uploading file:", error.message);
        throw error;
    }
} 
 

async function saveFileToDatabase(fileObject, fileId) {
    try {
        const newFile = new driveFile({
            filename: fileObject.originalname,
            mimetype: fileObject.mimetype,
            fileId: fileId
        });

        await newFile.save();

        console.log(`File ${newFile.filename} saved to database.`);
    } catch (error) {
        console.error(`Error saving file ${fileObject.filename} to database:`, error);
        throw error;
    }
}


router.get("/portfolio", async (req, res) => {
    try {
        res.render("./EducationFolder/portfolio");
    }
    catch (error) {
        console.error(error);
        res.send(error);
    }
});

router.get("/projects", async (req, res) => {
    try {
        res.render('./EducationFolder/projects')
    } catch (error) {
        console.error(error);
        res.send(error);
    }
});

router.get("/testimonials", async (req, res) => {
    try {
        res.render('./EducationFolder/testimonial_form');
    } catch (error) {
        console.error(error);
        res.send(error);
    }
});

router.post("/submitTestimonials", async (req, res) => {
    try {
        const { clientName, clientTitle, testimonialContent, projectDetails } = req.body;
        const newTestimonials = new testimonial({
            clientName,
            clientTitle,
            testimonialContent,
            projectDetails,
        });
        await newTestimonials.save();
        res.status(200).json({ message: "Testimonials Submitted successfully..." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/fetchTestimonialData", async (req, res) => {
    try {
        const testimonials = await testimonial.find();

        res.status(200).json({ testimonials });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/services", async (req, res) => {
    try {
        res.render("./services/services");
    } catch (error) {
        console.error(error);
        res.send(error)
    }
});

router.get("/clients", async (req, res) => {
    try {
        res.render("./services/Clients");

    } catch (error) {
        res.send(error);
    }
});

router.get("/faq", async (req, res) => {
    try {
        res.render("./services/faq");
    } catch (error) {
        res.send(error);
        console.error(error);
    }
});

router.get("/publications", async (req, res) => {
    try {
        res.render("./services/publications");
    } catch (error) {
        res.send(error);
        console.error(error);
    }
});

router.get("/awards", async (req, res) => {
    try {
        res.render("./services/awards");
    } catch (error) {
        res.send(error);
        console.error(error);
    }
});

router.get("/gallery", async (req, res) => {
    try {
        res.render("./services/gallery");
    } catch (error) {
        res.send(error);
        console.error(error);
    }
});

router.get("/gallery-form", isAuthenticated, async (req, res) => {
    try {
        res.render("./services/gallery-form");
    } catch (error) {
        console.error(error);
        res.send(error);
    }
});

router.post("/gallery-form-data", isAuthenticated, uploadGalleryInDrive.array('galleryImage'), async (req, res) => {
    try {
        const { galleryName, description, author, date } = req.body;
console.log(galleryName)
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                let fileId;

                const fileSizeInBytes = file.size;
                const fileSizeInMb = fileSizeInBytes / (1024 * 1024);

                if (fileSizeInMb > 1) {
                    const compressedImageBuffer = await sharp(file.buffer)
                        .resize({ width: 800 })
                        .jpeg({ quality: 70 })
                        .toBuffer();

                    fileId = await uploadGalleryToDrive({
                        buffer: compressedImageBuffer,
                        originalname: file.originalname,
                        mimetype: 'image/jpeg'
                    });
                } else {
                    fileId = await uploadGalleryToDrive(file);
                }

                await saveGalleryToDatabase(file, fileId, galleryName, description, author, date);
            }
        }

        res.status(200).json({ message: "New gallery added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

async function uploadGalleryToDrive(fileObject) {
    try {
        const bufferStream = new stream.PassThrough();
        bufferStream.end(fileObject.buffer);

        const { data } = await drive.files.create({
            requestBody: {
                name: fileObject.originalname,
                parents: [Id_for_Gallery],
            },
            media: {
                mimeType: fileObject.mimetype,
                body: bufferStream,
            },
        });

        console.log(`Uploaded file ${data.name} (${data.id})`);
        return data.id;
    } catch (error) {
        console.error("Error uploading file:", error.message);
        throw error;
    }
}

async function saveGalleryToDatabase(fileObject, fileId, galleryName, description, author, date) {
    try {
        const newGallery = new Gallery({
            galleryName: galleryName || null,
            description: description || null,
            author: author || null,
            date: date || null,
            filename: fileObject.originalname,
            mimetype: fileObject.mimetype,
            fileId: fileId
        });

        await newGallery.save();

        console.log(`File ${newGallery.filename} saved to database.`);
    } catch (error) {
        console.error(`Error saving file ${fileObject.originalname} to database:`, error);
        throw error;
    }
} 


router.post("/fetch-data-from-gallery", isAuthenticated, async (req, res) => {
    try {
        const galleries = await Gallery.find();
        if (!galleries || galleries.length === 0) {
            return res.status(404).json({ message: "Galleries not available." });
        }
        res.status(200).json(galleries);
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ message: `Internal server error: ${error}` });
    }
});

router.post("/update-gallery-info", isAuthenticated, async (req, res) => {
    try {
        const { galleryName, author, description, fileId } = req.body;

        const driveResponse = await drive.files.update({
            fileId: fileId,
            resource: {
                name: galleryName,
                description: description,
            },
        });

        const updatedGallery = await Gallery.findOneAndUpdate(
            { fileId: fileId },
            { galleryName, author, description },
            { new: true }
        );

        if (driveResponse.status === 200 && updatedGallery) {
            res.status(200).json({ message: "Gallery information updated successfully" });
        } else {
            res.status(500).json({ error: "Failed to update gallery information" });
        }

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/delete-gallery', isAuthenticated, async (req, res) => {
    try {
        const { fileId } = req.body;

        const driveDeleteResponse = await drive.files.delete({
            fileId: fileId
        });

        if (driveDeleteResponse.status === 204) {
            const dbDeleteResponse = await Gallery.findOneAndDelete({ fileId: fileId });

             if (dbDeleteResponse) {
               res.status(200).json({ message: 'File deleted successfully' });
            } else {
                res.status(500).json({ message: 'Failed to delete file record from the database' });
            }
        } else {
            res.status(500).json({ message: 'Failed to delete file from Google Drive' });
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



router.post('/get-gallery-img',isAuthenticated,async(req,res)=>{
    try {
            const galleriesData = await Gallery.find();
            if(!galleriesData)
            {
              return  res.status(400).json({message:"no galleries available"})
            }
            res.status(200).json(galleriesData)
    } catch (error) {
        console.error(error)
        res.status(500).json({error:'Internal server error'});
    }
});


export default router;