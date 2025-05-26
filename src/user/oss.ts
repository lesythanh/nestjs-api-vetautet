import * as fs from "fs"
import * as multer from "multer"

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
        fs.mkdirSync('uploads')
    } catch (error) {
        
    }
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + '-' + file.originalname
    cb(null, uniqueSuffix)
  }
})

// const upload = multer({ storage: storage })

export {storage};
