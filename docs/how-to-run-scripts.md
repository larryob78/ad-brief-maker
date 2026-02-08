# How To Run Scripts - Step by Step Guide

This guide walks you through running the scripts in this repo. Written for beginners - no prior experience needed.


## Before You Start

You need two things:

1. **Terminal** - This is an app already on your Mac. It lets you type commands.
2. **This repository** - Downloaded (cloned) to your Mac.


## Opening Terminal

1. Press `Cmd + Space` (opens Spotlight search)
2. Type the word `Terminal`
3. Press `Enter`
4. A window with a blinking cursor appears - that's Terminal


## Navigating To This Repo

When you open Terminal, you start in your home folder. You need to go to where this repo is saved.

If you cloned it to your home folder, type:

```bash
cd ad-brief-maker
```

If it's somewhere else (like your Desktop), type:

```bash
cd ~/Desktop/ad-brief-maker
```

**Tip:** You can also type `cd ` (with a space after it) and then drag the folder from Finder into the Terminal window. It will fill in the path for you.


## Running The Downloads Cleanup Script

```bash
cd scripts/cleanup
bash cleanup-downloads.sh
```

**What will happen:**

1. The script scans your Downloads folder
2. It shows you a summary: how many files, total size
3. It finds duplicates (files with names like "report (1).pdf")
4. It finds large files (over 100MB)
5. It finds oversized images (over 10MB)
6. It saves a report to your Downloads folder
7. It asks what you want to do:
   - Organize files into folders
   - Move duplicates aside
   - Both
   - Nothing (just review the report)


## Running The Mac Optimization Script

```bash
cd scripts/optimize
bash optimize-mac.sh
```

**What will happen:**

1. It checks your disk space
2. For each step, it tells you what it found and asks permission:
   - Clear app caches (temporary files)
   - Clear old log files
   - Clear browser caches
   - Flush DNS cache (helps web browsing)
   - Clear temp files
   - Empty Trash
3. It shows your biggest space-using folders
4. It lists apps that start when you boot up
5. It checks your RAM usage
6. It offers to run system maintenance
7. It gives you tips for keeping your Mac fast

**You can say "n" (no) to any step you're unsure about.**


## If Something Goes Wrong

**"Permission denied" error:**
Try adding `sudo` before the command:
```bash
sudo bash cleanup-downloads.sh
```
It will ask for your Mac password. When you type it, nothing appears on screen - that's normal. Just type it and press Enter.

**"No such file or directory" error:**
You're probably in the wrong folder. Type:
```bash
pwd
```
This shows where you are. Then use `cd` to navigate to the right place.

**"command not found" error:**
Make sure you typed `bash` before the script name:
```bash
bash cleanup-downloads.sh    # correct
cleanup-downloads.sh          # might not work
```


## Useful Terminal Commands

| Command | What it does |
|---------|-------------|
| `pwd` | Shows which folder you're in |
| `ls` | Lists files in the current folder |
| `cd foldername` | Go into a folder |
| `cd ..` | Go back one folder |
| `cd ~` | Go to your home folder |
| `clear` | Clears the screen |
