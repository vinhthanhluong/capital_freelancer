import gulp from "gulp";
import plumber from "gulp-plumber";
import ejs from "gulp-ejs";
import frontMatter from "gulp-front-matter";
import wrapper from "layout-wrapper";
import rename from "gulp-rename";
import browser, { stream } from "browser-sync";
import autoprefixer from "gulp-autoprefixer";
import sourcemaps from "gulp-sourcemaps";
import postcss from "gulp-postcss";
import del from "del";
import fs from "fs";
import webp from "gulp-webp";
import merge from "merge-stream";
import pathModule from "path";
import { fileURLToPath } from "url";
import gulpCached from "gulp-cached";
import cssnano from "cssnano";
import gulpSass from "gulp-sass";
import * as dartSass from "sass";
import sortMediaQueries from "postcss-sort-media-queries";

const sass = gulpSass(dartSass);
const browserSync = browser.create();

// __dirname fix cho ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = pathModule.dirname(__filename);

// Cấu hình path
const path = {
    ejs: {
        layoutDir: `${__dirname}/src/layouts`,
        src: ["./src/**/*.ejs", "!./src/**/_*.ejs"],
        dist: "./public/",
    },
    json: {
        package: "./package.json",
        newsList: "./src/_data/newsList.json",
    },
};

const rootFolder = pathModule.basename(process.cwd());

// Đọc file cấu hình XAMPP
const filePath = "build_xampp.txt";
let path_xampp = "";
if (fs.existsSync(filePath)) {
    path_xampp = fs.readFileSync(filePath, "utf8").trim();
}

// Load dữ liệu JSON
const pkg = JSON.parse(fs.readFileSync(path.json.package, "utf8"));
const newsListJson = JSON.parse(fs.readFileSync(path.json.newsList, "utf8"));

global.jsonData = {
    newsListJson,
};

// Clean assets
function clean() {
    return del(["./public/assets/"]);
}

// Hàm xử lý copy nhiều đích
function copyTo(src, ...dests) {
    let stream = gulp.src(src);
    dests.forEach((dest) => {
        stream = stream.pipe(gulp.dest(dest));
    });
    return stream;
}

// CSS
function style() {
    const dests = ["./public/assets/css", path_xampp ? `${path_xampp}/assets/css` : null];
    const processors = [sortMediaQueries({ sort: "mobile-first" }), cssnano()];

    let stream = gulp
        .src("./src/assets/scss/*.scss")
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError))
        .pipe(autoprefixer({ cascade: false }))
        .pipe(postcss(processors))
        .pipe(sourcemaps.write("."))
        .pipe(gulpCached("linting"))
        .pipe(gulp.dest(dests[0]));

    if (dests[1]) {
        stream = stream.pipe(gulp.dest(dests[1]));
    }

    return stream;
}

// SCSS
function scss() {
    const dests = ["./public/assets/scss", path_xampp ? `${path_xampp}/assets/scss` : null].filter(Boolean);
    return copyTo("./src/assets/scss/**/*.scss", ...dests);
}

// JS
function scripts() {
    const dests = ["./public/assets/js", path_xampp ? `${path_xampp}/assets/js` : null].filter(Boolean);
    return copyTo("./src/assets/js/**/*.js", ...dests);
}

// Vender
function vender() {
    const dests = ["./public/assets/vender", path_xampp ? `${path_xampp}/assets/vender` : null].filter(Boolean);
    return copyTo("./src/assets/vender/**", ...dests);
}
// Vender
function blockTheme() {
    const dests = ["./public/assets/block-theme", path_xampp ? `${path_xampp}/assets/block-theme` : null].filter(
        Boolean
    );
    return copyTo("./src/assets/block-theme/**", ...dests);
}

// Images

// function images() {
//     const dests = ["./public/assets/images", path_xampp ? `${path_xampp}/assets/images` : null].filter(Boolean);

//     // Ảnh gốc
//     const originalImages = gulp.src("./src/assets/images/**/*.+(gif|svg|ico|webp)").pipe(gulp.dest(dests[0]));
//     // .pipe(gulp.dest(dests[1]));

//     // Convert sang WebP
//     const webpImages = gulp.src("./src/assets/images/**/*.+(jpg|jpeg|png)").pipe(webp()).pipe(gulp.dest(dests[0]));
//     // .pipe(gulp.dest(dests[1]));

//     return merge(originalImages, webpImages);
// }

function images() {
    const dests = ["./public/assets/images", path_xampp ? `${path_xampp}/assets/images` : null].filter(Boolean);

    // Ảnh gốc
    const originalImages = gulp.src("./src/assets/images/**/*.+(gif|svg|ico|webp)").pipe(gulp.dest(dests[0]));

    // Convert sang WebP
    const webpImages = gulp.src("./src/assets/images/**/*.+(jpg|jpeg|png)").pipe(webp()).pipe(gulp.dest(dests[0]));

    // Nếu có dests[1] thì copy thêm
    let extra = [];
    if (dests[1]) {
        extra.push(
            gulp.src("./src/assets/images/**/*.+(gif|svg|ico|webp)").pipe(gulp.dest(dests[1])),
            gulp.src("./src/assets/images/**/*.+(jpg|jpeg|png)").pipe(webp()).pipe(gulp.dest(dests[1]))
        );
    }

    return merge(originalImages, webpImages, ...extra);
}

// Videos
// function videos() {
//     const dests = ["./public/assets/videos", path_xampp ? `${path_xampp}/assets/videos` : null].filter(Boolean);
//     return copyTo("./src/assets/videos/**/*.+(mp4|webm|ogg)", ...dests);
// }

// Theme WP
// function theme_wp() {
//     const dests = ["./public/theme_wp"];
//     if (path_xampp) dests.push(path_xampp);
//     return copyTo("./src/theme_wp/**/*", ...dests);
// }

// Templates
function templates() {
    return gulp
        .src(path.ejs.src)
        .pipe(plumber())
        .pipe(frontMatter({ property: "data" }))
        .pipe(ejs(pkg))
        .pipe(
            wrapper({
                layout: path.ejs.layoutDir,
                data: {
                    name: "ホゲのサイト",
                    layoutsDir: path.ejs.layoutDir,
                    baseUrl: pkg.baseUrl,
                },
                engine: "ejs",
                frontMatterProp: "data",
            })
        )
        .pipe(ejs(pkg, { ext: ".html" }))
        .pipe(rename({ extname: ".html" }))
        .pipe(gulp.dest(path.ejs.dist));
}
// PostCSS
function post_css() {
    const processors = [sortMediaQueries({ sort: "mobile-first" })];
    return gulp
        .src("./src/assets/scss/*.scss")
        .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError))
        .pipe(autoprefixer({ cascade: false }))
        .pipe(postcss(processors))
        .pipe(gulp.dest("./public/assets/css"));
}

// Watch task
function watchFiles() {
    browserSync.init({
        watch: true,
        server: { baseDir: "./public" },
        port: 8080,
    });

    gulp.watch("./src/assets/scss/**/*.scss", gulp.parallel(style));
    gulp.watch("./src/assets/vender/**", vender);
    gulp.watch("./src/assets/block-theme/**", blockTheme);
    gulp.watch("./src/assets/js/**/*.js", gulp.parallel(scripts));
    gulp.watch("./src/assets/images/**", images);
    // gulp.watch("./src/assets/videos/**", videos);
    // gulp.watch("./src/theme_wp/**", theme_wp);
    gulp.watch("./src/**/*.ejs", templates);
    gulp.watch(["./public/*.html", "./src/assets/sass/**/*.scss"]).on("change", browserSync.reload);
}

// Export
const build = gulp.series(clean, gulp.parallel(style, vender, blockTheme, scripts, images, templates));

export { style, scss, scripts, vender, blockTheme, images, templates, watchFiles as watch, post_css, build, clean };
