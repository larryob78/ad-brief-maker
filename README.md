# Ad Brief Maker

AI-powered tool for creating comprehensive advertising briefs with automated content generation and strategic planning.


## How This Repo Is Organized

Everything is kept in clearly named folders so you always know where to find things.

```
ad-brief-maker/
|
|-- scripts/              <-- All runnable tools live here
|   |-- cleanup/          <-- Tools to tidy up files
|   |   |-- cleanup-downloads.sh
|   |
|   |-- optimize/         <-- Tools to speed up your Mac
|       |-- optimize-mac.sh
|
|-- docs/                 <-- Guides and notes
|   |-- how-to-run-scripts.md
|
|-- LICENSE               <-- Legal stuff (MIT license)
|-- README.md             <-- This file (you are here)
```

**Rule of thumb:** Each tool or project gets its own folder inside `scripts/`. This keeps things separate and easy to find.


## Quick Start

### 1. Clean Up Your Downloads Folder

This script finds duplicate files, oversized images, and large files clogging up your Downloads. It then offers to organize everything into neat folders (Documents, Images, Videos, etc.).

**Nothing is deleted without your permission.**

Open Terminal on your Mac and run:

```bash
cd ~/path-to-this-repo/scripts/cleanup
bash cleanup-downloads.sh
```

### 2. Speed Up Your Mac

This script clears caches, old logs, browser junk, and runs system maintenance. It also shows you what's using the most space and which apps are slowing down your startup.

**It asks before every action. Nothing happens without your say-so.**

Open Terminal on your Mac and run:

```bash
cd ~/path-to-this-repo/scripts/optimize
bash optimize-mac.sh
```


## How To Open Terminal

1. Press `Cmd + Space` to open Spotlight
2. Type `Terminal`
3. Press Enter

That's it - you now have a command line ready to go.


## Tips For Keeping Things Organized

- **One folder per project** - Never mix files from different projects
- **Name files clearly** - Use descriptive names like `cleanup-downloads.sh` not `script1.sh`
- **Use this repo as your home base** - Keep all your tools and scripts here
- **When you build something new**, create a new folder for it inside `scripts/`


## Need Help?

If something goes wrong or you get an error, don't panic:

1. Read the error message - it usually tells you what went wrong
2. Make sure you're in the right folder
3. Check the [docs/how-to-run-scripts.md](docs/how-to-run-scripts.md) guide for step-by-step instructions
