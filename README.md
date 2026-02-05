# Annotation to PDF

Figma plugin that converts Dev Mode annotations to visible callout elements for PDF export.

## Overview

Dev Mode annotations in Figma are not included in PDF exports. This plugin creates visible callout elements from annotations, allowing you to export them in PDFs for client deliverables and documentation.

## Features

- **Annotation Reading**: Reads all Dev Mode annotations from selected frames
- **Visual Callouts**: Generates numbered callout elements with annotation content
- **Number Markers**: Places numbered badges on annotated elements
- **Connector Lines**: Draws dashed lines connecting markers to callouts
- **Easy Cleanup**: One-click removal of all generated callouts
- **Pinned Properties**: Displays pinned inspection properties in callouts

## Installation

### Development Setup

```bash
# Navigate to project directory
cd figma-annotation-to-visible-element

# Install dependencies
npm install

# Build TypeScript
npm run build

# Or watch for changes during development
npm run watch
```

### Import to Figma

1. Open Figma Desktop app
2. Go to **Plugins** → **Development** → **Import plugin from manifest...**
3. Select the `manifest.json` file from this project

## Usage

### Workflow

1. **Add Annotations**: Use Figma's Dev Mode to add annotations to your design elements
2. **Select Frame**: Select the frame containing annotated elements (or let the plugin use the first frame on the page)
3. **Generate Callouts**: Click "Generate Callouts" to create visible callout elements
4. **Export PDF**: Use File → Export to export your design with visible callouts
5. **Cleanup**: Click "Remove Callouts" to delete all generated elements

### Tips

- Annotations are numbered based on their position (top-to-bottom, left-to-right)
- Callouts are placed to the right of annotated elements
- The original Dev Mode annotations remain intact after removal
- You can regenerate callouts at any time

## File Structure

```
figma-annotation-to-visible-element/
├── manifest.json      # Plugin configuration
├── code.ts           # Main plugin logic (TypeScript)
├── code.js           # Compiled JavaScript (generated)
├── ui.html           # Plugin UI
├── package.json      # Node.js dependencies
├── tsconfig.json     # TypeScript configuration
└── README.md         # This file
```

## Customization

### Colors

Edit the `COLORS` object in `code.ts` to customize:

- Callout background and border colors
- Marker badge colors
- Text colors
- Connector line color

### Callout Layout

Modify `createCalloutElement()` to adjust:

- Padding and spacing
- Font sizes
- Callout width
- Corner radius

## Requirements

- Figma Desktop App
- Node.js 18+ (for development)
- TypeScript (installed via npm)

## Limitations

- Requires Dev Mode access in Figma
- Callouts are placed to the right of elements (may overlap in dense layouts)
- Markdown formatting in annotations is displayed as plain text

## License

MIT
