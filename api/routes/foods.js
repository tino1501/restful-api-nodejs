const express = require("express");
const router = express.Router();
const multer = require("multer");
const sharp = require("sharp");

const checkAuth = require("../middlewares/check-authorization");
const ProductController = require("../controllers/foods");

const MAX_SIZE = 1024 * 1024 * 1; // 10MB

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        cb(null, true);
    } else {
        //reject a file

        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: MAX_SIZE,
    },
    fileFilter: fileFilter,
});

const checkFileSize = (req, res, next) => {
    if (req.file && req.file.size > MAX_FILE_SIZE) {
        return res.status(413).send("Kích thước file quá lớn.");
    }
    next();
};

const compressImage = (req, res, next) => {
    if (
        req.file &&
        (req.file.mimetype === "image/jpeg" ||
            req.file.mimetype === "image/png")
    ) {
        sharp(req.file.buffer)
            .resize(800) // Điều chỉnh kích thước ảnh theo yêu cầu
            .toBuffer()
            .then((data) => {
                req.file.buffer = data;
                next();
            })
            .catch((err) => {
                console.log("Loi khi nen anh: ", err);
                return res.status(500).send("Lỗi khi nén ảnh.");
            });
    } else {
        next();
    }
};

router.get("/", ProductController.get_all);

router.get("/:_id", ProductController.get_food);

router.post(
    "/",
    checkAuth,
    upload.single("file"),
    ProductController.create_food
);

router.patch("/:_id", checkAuth, ProductController.update_food);

router.delete("/deleteAll", checkAuth, ProductController.delete_all);

router.delete("/:_id", checkAuth, ProductController.delete_food);

module.exports = router;
