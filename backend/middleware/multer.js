import multer from "multer";

const storage = multer.diskStorage({
    filename: function(req, file, cb){
        cb(null, `${Date.now()}-${file.originalname}`);
    }
})

// File filter to allow only images
const fileFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image/')){
        cb(null, true)
    } else{
        cb(new Error('Only image files are allowed'), false);
    }
}

const upload = multer({storage, fileFilter});

export default upload;