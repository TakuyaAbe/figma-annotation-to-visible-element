# Annotation to PDF

[日本語版 README はこちら](./README_ja.md)

A Figma plugin that converts Dev Mode annotations into visible callout elements for PDF export.

## Problem

When creating designs in Figma, you can use Dev Mode's annotation feature to add notes for developers. However, these annotations have limitations:

- **Not included in PDF exports** - Annotations are Dev Mode-only features and won't appear when exporting as PDF
- **Can't be used for client deliverables** - When delivering design specs or style guides as PDF, annotation content needs to be documented separately
- **Can't be printed** - When printing for review, annotations are not included

## Solution

This plugin automatically generates **visible callout elements** from Dev Mode annotations. The generated callouts are regular Figma objects, so they are included in PDF exports and prints.

## Use Cases

### PDF Delivery of Design Specifications
Use when delivering design specifications to clients or external partners as PDF, and you want to include developer notes.

### Creating Design Review Materials
Create PDFs with annotations for team design reviews or presentations.

### Offline Reference Documents
Create PDFs with annotations for reviewing design specs in environments without internet access.

## Features

- **Annotation Detection**: Automatically detects Dev Mode annotations within selected frames
- **Callout Generation**: Generates numbered callout elements automatically
- **Smart Positioning**: Auto-positions callouts on left or right based on element position (outside the frame)
- **Marker Display**: Places numbered badges on annotated elements
- **Connector Lines**: Connects markers and callouts with dashed lines
- **Multiple Frame Support**: Select multiple frames for batch generation (numbering resets for each frame)
- **Section Support**: When frames are inside a section, callouts are also placed in that section
- **Easy Cleanup**: Remove all generated callouts with one click

## Installation

### Download from Release (Recommended)

1. Go to [Releases](https://github.com/because440/figma-annotation-to-visible-element/releases)
2. Download the latest `annotation-to-pdf-vX.X.X.zip`
3. Extract the zip file
4. Open Figma desktop app
5. Go to **Plugins** → **Development** → **Import plugin from manifest...**
6. Select the `manifest.json` file from the extracted folder

## Usage

### Basic Workflow

1. **Add Annotations**: Add annotations to design elements in Figma's Dev Mode
2. **Select Frames**: Select frames containing annotations (multiple selection supported)
3. **Generate Callouts**: Click "Generate Callouts"
4. **Export PDF**: File → Export to output PDF
5. **Cleanup**: Click "Remove Callouts" to delete generated callouts

### Tips

- Annotations are numbered by position (top to bottom, left to right)
- Callouts for elements on the left half of a frame appear on the left; right half elements get callouts on the right
- Original Dev Mode annotations are not deleted (they remain after callout removal)
- When selecting multiple frames, numbering resets to 1 for each frame

## Requirements

- Figma Desktop App
- Dev Mode access

## Limitations

- Requires Dev Mode access
- Markdown formatting in annotations is displayed as plain text

## License

MIT

---

## For Developers

### Development Setup

```bash
cd figma-annotation-to-visible-element

# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch for changes during development
npm run watch
```

### Import to Figma (Development)

1. Open Figma desktop app
2. Go to **Plugins** → **Development** → **Import plugin from manifest...**
3. Select the `manifest.json` file from this project

### File Structure

```
figma-annotation-to-visible-element/
├── manifest.json      # Plugin configuration
├── code.ts           # Main logic (TypeScript)
├── code.js           # Compiled JavaScript
├── ui.html           # Plugin UI
├── package.json      # Node.js dependencies
├── tsconfig.json     # TypeScript configuration
├── README.md         # This file
└── README_ja.md      # Japanese README
```

### Customization

#### Changing Colors

Edit the `COLORS` object in `code.ts`:

- Callout background and border colors
- Marker colors
- Text colors
- Connector line color

#### Changing Sizes

Edit constants in `code.ts`:

- `CALLOUT_WIDTH`: Callout width (default: 130px)
- `CALLOUT_GAP`: Gap between frame and callout (default: 24px)
- `MARKER_SIZE`: Marker size (default: 24px)
