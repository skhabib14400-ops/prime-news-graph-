import os
import zipfile
import shutil

print("📦 Starting Python Zip Packaging Pipeline...")

os.makedirs("public/downloads", exist_ok=True)
os.makedirs("dist/downloads", exist_ok=True)

# 1. Direct Netlify Drop ZIP
# Contains all contents of dist/ directly at root level
netlify_zip_path = "public/downloads/prime-news-graph-direct-netlify-drop.zip"
print(f"Creating {netlify_zip_path}...")

with zipfile.ZipFile(netlify_zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk("dist"):
        # Skip downloads directory inside dist
        if "downloads" in dirs:
            dirs.remove("downloads")
        for file in files:
            file_path = os.path.join(root, file)
            # relative path from dist
            arcname = os.path.relpath(file_path, "dist")
            zf.write(file_path, arcname)

print(f"✅ Netlify Drop ZIP created ({os.path.getsize(netlify_zip_path) / (1024*1024):.2f} MB)")

# 2. GitHub & Vercel Clean Source ZIP
# Contains clean source code for GitHub repo & Vercel deployment
# Excludes node_modules, dist, .git, .cache, .vite, *.zip, large screen recordings
github_zip_path = "public/downloads/prime-news-graph-github-vercel.zip"
print(f"Creating {github_zip_path}...")

excluded_dirs = {"node_modules", "dist", ".git", ".vite", ".cache", "downloads", "aistudio"}
excluded_extensions = {".zip", ".mp4", ".tar.gz", ".log"}

with zipfile.ZipFile(github_zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk("."):
        # Filter out unwanted directories in-place
        dirs[:] = [d for d in dirs if d not in excluded_dirs and not d.startswith(".git")]
        
        for file in files:
            _, ext = os.path.splitext(file)
            if ext.lower() in excluded_extensions:
                continue
            if file.startswith("Screenrecording") or file.startswith("."):
                if file not in {".gitignore", ".env.example"}:
                    continue
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, ".")
            zf.write(file_path, arcname)

print(f"✅ GitHub & Vercel ZIP created ({os.path.getsize(github_zip_path) / (1024*1024):.2f} MB)")

# Copy archives to dist/downloads and public/ for easy download URLs
shutil.copy(netlify_zip_path, "dist/downloads/")
shutil.copy(github_zip_path, "dist/downloads/")
shutil.copy(netlify_zip_path, "public/")
shutil.copy(github_zip_path, "public/")
shutil.copy(netlify_zip_path, "dist/")
shutil.copy(github_zip_path, "dist/")

print("🚀 All deployment packages ready!")
