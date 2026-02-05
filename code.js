"use strict";
// Annotation to PDF Exporter
// Converts Dev Mode annotations to visible callouts for PDF export
const CALLOUT_GROUP_NAME = "__ANNOTATION_CALLOUTS__";
const CALLOUT_WIDTH = 130;
const CALLOUT_GAP = 24;
const MARKER_SIZE = 24;
// Colors
const COLORS = {
    calloutBg: { r: 1, g: 0.98, b: 0.94 }, // Warm white
    calloutBorder: { r: 0.93, g: 0.79, b: 0.55 }, // Soft gold
    markerBg: { r: 0.91, g: 0.30, b: 0.24 }, // Red
    markerText: { r: 1, g: 1, b: 1 }, // White
    headerText: { r: 0.47, g: 0.33, b: 0.15 }, // Dark gold
    bodyText: { r: 0.2, g: 0.2, b: 0.2 }, // Dark gray
    propText: { r: 0.45, g: 0.45, b: 0.45 }, // Gray
    connectorLine: { r: 0.75, g: 0.75, b: 0.75 }, // Light gray
};
// Collect all annotations from a node tree
async function collectAnnotations(root) {
    const results = [];
    function traverse(node) {
        // Check if node has annotations (Dev Mode feature)
        if ('annotations' in node) {
            const nodeWithAnnotations = node;
            if (nodeWithAnnotations.annotations && nodeWithAnnotations.annotations.length > 0) {
                for (const ann of nodeWithAnnotations.annotations) {
                    if (node.absoluteBoundingBox) {
                        results.push({
                            node,
                            annotation: ann,
                            bounds: {
                                x: node.absoluteBoundingBox.x,
                                y: node.absoluteBoundingBox.y,
                                width: node.absoluteBoundingBox.width,
                                height: node.absoluteBoundingBox.height,
                            },
                        });
                    }
                }
            }
        }
        // Traverse children
        if ('children' in node) {
            const parent = node;
            for (const child of parent.children) {
                traverse(child);
            }
        }
    }
    traverse(root);
    return results;
}
// Determine which side the callout should be placed
function determineCalloutSide(elementBounds, frameBounds) {
    // Determine which half of the frame the element is in
    const elementCenterX = elementBounds.x + elementBounds.width / 2;
    const frameCenterX = frameBounds.x + frameBounds.width / 2;
    // If element is on left half, place callout on left OUTSIDE the frame
    // If element is on right half, place callout on right OUTSIDE the frame
    return elementCenterX < frameCenterX ? 'left' : 'right';
}
// Create a number marker badge
function createMarker(index, bounds, side) {
    const marker = figma.createFrame();
    marker.name = `Marker ${index}`;
    marker.resize(MARKER_SIZE, MARKER_SIZE);
    marker.cornerRadius = MARKER_SIZE / 2;
    marker.fills = [{ type: 'SOLID', color: COLORS.markerBg }];
    // Layout settings for centering with FIXED size
    marker.layoutMode = 'HORIZONTAL';
    marker.primaryAxisSizingMode = 'FIXED';
    marker.counterAxisSizingMode = 'FIXED';
    marker.primaryAxisAlignItems = 'CENTER';
    marker.counterAxisAlignItems = 'CENTER';
    const num = figma.createText();
    num.characters = String(index);
    num.fontSize = 12;
    num.fontName = { family: "Inter", style: "Medium" };
    num.fills = [{ type: 'SOLID', color: COLORS.markerText }];
    marker.appendChild(num);
    // Position marker based on side
    if (side === 'right') {
        // Top-right corner
        marker.x = bounds.x + bounds.width - MARKER_SIZE / 2;
    }
    else {
        // Top-left corner
        marker.x = bounds.x - MARKER_SIZE / 2;
    }
    marker.y = bounds.y - MARKER_SIZE / 2;
    return marker;
}
// Create a callout element with annotation content
function createCalloutElement(index, annotation, targetBounds, frameBounds, side) {
    const callout = figma.createFrame();
    callout.name = `Callout ${index}`;
    // Container styling
    callout.cornerRadius = 6;
    callout.fills = [{ type: 'SOLID', color: COLORS.calloutBg }];
    callout.strokes = [{ type: 'SOLID', color: COLORS.calloutBorder }];
    callout.strokeWeight = 1;
    // Compact padding
    callout.paddingTop = 10;
    callout.paddingBottom = 10;
    callout.paddingLeft = 12;
    callout.paddingRight = 12;
    // Auto-layout
    callout.layoutMode = 'VERTICAL';
    callout.primaryAxisSizingMode = 'AUTO';
    callout.counterAxisSizingMode = 'AUTO';
    callout.itemSpacing = 6;
    // Calculate text width (CALLOUT_WIDTH minus padding)
    const textWidth = CALLOUT_WIDTH - 24;
    // Header with number
    const header = figma.createText();
    header.characters = `#${index}`;
    header.fontSize = 12;
    header.fontName = { family: "Inter", style: "Medium" };
    header.fills = [{ type: 'SOLID', color: COLORS.headerText }];
    callout.appendChild(header);
    // Annotation content (markdown or plain text)
    const content = annotation.labelMarkdown || annotation.label || '';
    if (content) {
        const body = figma.createText();
        body.characters = content;
        body.fontSize = 11;
        body.fontName = { family: "Inter", style: "Regular" };
        body.fills = [{ type: 'SOLID', color: COLORS.bodyText }];
        body.layoutSizingHorizontal = 'FIXED';
        body.resize(textWidth, body.height);
        body.textAutoResize = 'HEIGHT';
        callout.appendChild(body);
    }
    // Pinned properties (if any)
    if (annotation.properties && annotation.properties.length > 0) {
        // Add separator
        const separator = figma.createFrame();
        separator.name = 'Separator';
        separator.resize(textWidth, 1);
        separator.fills = [{ type: 'SOLID', color: COLORS.calloutBorder }];
        callout.appendChild(separator);
        // Property types are predefined inspection properties
        for (const prop of annotation.properties) {
            const propText = figma.createText();
            propText.characters = `• ${prop.type}`;
            propText.fontSize = 10;
            propText.fontName = { family: "Inter", style: "Regular" };
            propText.fills = [{ type: 'SOLID', color: COLORS.propText }];
            callout.appendChild(propText);
        }
    }
    // Position callout OUTSIDE the frame bounds
    if (side === 'right') {
        // Place to the right of the FRAME (not the element)
        callout.x = frameBounds.x + frameBounds.width + CALLOUT_GAP;
    }
    else {
        // Place to the left of the FRAME (not the element)
        callout.x = frameBounds.x - CALLOUT_WIDTH - CALLOUT_GAP;
    }
    // Y position aligned with the target element
    callout.y = targetBounds.y;
    return callout;
}
// Create connector line between marker and callout
function createConnectorLine(markerX, markerY, calloutX, calloutY, calloutWidth, side) {
    const vector = figma.createVector();
    vector.name = 'Connector';
    let startX, startY, endX, endY;
    if (side === 'right') {
        // Connector goes from right edge of marker to left edge of callout
        startX = markerX + MARKER_SIZE;
        startY = markerY + MARKER_SIZE / 2;
        endX = calloutX;
        endY = calloutY + 16;
    }
    else {
        // Connector goes from left edge of marker to right edge of callout
        startX = markerX;
        startY = markerY + MARKER_SIZE / 2;
        endX = calloutX + calloutWidth;
        endY = calloutY + 16;
    }
    // Create bezier curve path
    const controlOffset = Math.abs(endX - startX) * 0.3;
    const path = {
        windingRule: 'NONZERO',
        data: side === 'right'
            ? `M ${startX} ${startY} C ${startX + controlOffset} ${startY} ${endX - controlOffset} ${endY} ${endX} ${endY}`
            : `M ${startX} ${startY} C ${startX - controlOffset} ${startY} ${endX + controlOffset} ${endY} ${endX} ${endY}`,
    };
    vector.vectorPaths = [path];
    vector.strokes = [{ type: 'SOLID', color: COLORS.connectorLine }];
    vector.strokeWeight = 1;
    vector.dashPattern = [4, 4];
    vector.strokeCap = 'ROUND';
    return vector;
}
// Generate callouts for a single frame (returns created elements)
async function generateCalloutsForFrame(annotations, frameBounds) {
    const elementsCreated = [];
    // Sort annotations by vertical position for consistent numbering
    const sortedAnnotations = [...annotations].sort((a, b) => {
        if (Math.abs(a.bounds.y - b.bounds.y) < 50) {
            return a.bounds.x - b.bounds.x;
        }
        return a.bounds.y - b.bounds.y;
    });
    // Create callouts and markers (numbering starts from 1 for this frame)
    for (let i = 0; i < sortedAnnotations.length; i++) {
        const { annotation, bounds } = sortedAnnotations[i];
        const index = i + 1;
        // Determine which side to place the callout
        const side = determineCalloutSide(bounds, frameBounds);
        // Create marker (positioned at absolute coordinates)
        const marker = createMarker(index, bounds, side);
        figma.currentPage.appendChild(marker);
        elementsCreated.push(marker);
        // Create callout (positioned OUTSIDE the frame)
        const callout = createCalloutElement(index, annotation, bounds, frameBounds, side);
        figma.currentPage.appendChild(callout);
        elementsCreated.push(callout);
        // Create connector line
        const connector = createConnectorLine(marker.x, marker.y, callout.x, callout.y, callout.width, side);
        figma.currentPage.appendChild(connector);
        elementsCreated.push(connector);
    }
    return elementsCreated;
}
// Generate callouts for multiple frames
async function generateCallouts(frames) {
    // Load required fonts
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
    const allElements = [];
    let totalAnnotations = 0;
    // Process each frame
    for (const frame of frames) {
        const frameBounds = frame.absoluteBoundingBox;
        if (!frameBounds)
            continue;
        // Collect annotations for this frame
        const annotations = await collectAnnotations(frame);
        if (annotations.length === 0)
            continue;
        totalAnnotations += annotations.length;
        // Generate callouts for this frame (numbering resets to 1)
        const elements = await generateCalloutsForFrame(annotations, {
            x: frameBounds.x,
            y: frameBounds.y,
            width: frameBounds.width,
            height: frameBounds.height,
        });
        allElements.push(...elements);
    }
    // Group all elements together
    if (allElements.length > 0) {
        const group = figma.group(allElements, figma.currentPage);
        group.name = CALLOUT_GROUP_NAME;
    }
    return totalAnnotations;
}
// Remove all generated callouts
function removeCallouts() {
    const page = figma.currentPage;
    const calloutGroup = page.findOne((n) => n.name === CALLOUT_GROUP_NAME);
    if (calloutGroup) {
        calloutGroup.remove();
        return true;
    }
    return false;
}
// Main plugin logic
figma.showUI(__html__, { width: 280, height: 220 });
figma.ui.onmessage = async (msg) => {
    if (msg.type === 'generate') {
        try {
            // Determine targets: selection or all frames on page
            const selection = figma.currentPage.selection;
            let targets = [];
            if (selection.length > 0) {
                // Use all selected frames (filter to only include frames/groups/components)
                targets = selection.filter((n) => n.type === 'FRAME' || n.type === 'GROUP' || n.type === 'COMPONENT' || n.type === 'INSTANCE');
                // If no frames in selection, use the selection as-is
                if (targets.length === 0) {
                    targets = [...selection];
                }
            }
            else {
                // Use all frames on the page
                targets = figma.currentPage.children.filter((n) => n.type === 'FRAME' && n.name !== CALLOUT_GROUP_NAME);
            }
            if (targets.length === 0) {
                figma.notify('Please select frames or have at least one frame on the page', { error: true });
                return;
            }
            // Remove existing callouts first
            removeCallouts();
            // Generate callouts for all target frames
            const totalAnnotations = await generateCallouts(targets);
            if (totalAnnotations === 0) {
                figma.notify('No annotations found. Add annotations in Dev Mode first.', { error: true });
                return;
            }
            const frameCount = targets.length;
            figma.notify(`✨ Generated ${totalAnnotations} callout${totalAnnotations > 1 ? 's' : ''} across ${frameCount} frame${frameCount > 1 ? 's' : ''}`);
        }
        catch (error) {
            figma.notify('Error generating callouts. Check console for details.', { error: true });
        }
    }
    if (msg.type === 'remove') {
        const removed = removeCallouts();
        if (removed) {
            figma.notify('🧹 Callouts removed');
        }
        else {
            figma.notify('No callouts to remove');
        }
    }
};
