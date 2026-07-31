#!/usr/bin/env python3
"""
Design Agent MCP Server
=======================
AI design assistant for backyards and interior spaces.

Tools:
  design_start_project      — Start a new design project from a description/image
  design_set_layout         — Define the space dimensions and zone layout
  design_set_style          — Apply a design style (modern, farmhouse, tropical, etc.)
  design_update_zone        — Add or modify a specific zone (BBQ, play area, seating, etc.)
  design_render             — Render the current design as a high-quality PNG
  design_get_project        — View the current design state in JSON
  design_list_styles        — See all available styles and palettes
  design_list_zones         — See all available zone types with descriptions
  design_reset              — Clear and start fresh
"""

import json
import os
import math
import random
from pathlib import Path
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict
from mcp.server.fastmcp import FastMCP

# ── PIL for rendering ────────────────────────────────────────────────────────
try:
    from PIL import Image, ImageDraw, ImageFont
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

# ── Server init ──────────────────────────────────────────────────────────────
mcp = FastMCP("design_agent_mcp")

# ── State file ───────────────────────────────────────────────────────────────
STATE_DIR  = Path.home() / "Documents" / "DesignAgent"
STATE_FILE = STATE_DIR / "current_project.json"
FONT_DIR   = Path(os.environ.get("DESIGN_FONT_DIR", str(Path(__file__).parent / "fonts")))
OUTPUT_DIR = STATE_DIR / "renders"

STATE_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ═══════════════════════════════════════════════════════════════════════════════
#  STYLE PALETTES
# ═══════════════════════════════════════════════════════════════════════════════
STYLES: Dict[str, Dict] = {
    "modern_farmhouse": {
        "label": "Modern Farmhouse",
        "description": "White board-and-batten, black metal accents, warm wood, Edison lights",
        "colors": {
            "house_wall":    [215, 212, 207],
            "deck":          [135, 132, 128],
            "hardscape":     [198, 188, 168],
            "grass":         [72,  138,  58],
            "fence":         [68,   50,  32],
            "pergola":       [130,  85,  38],
            "furniture":     [38,   36,  34],
            "cushion":       [228, 220, 205],
            "accent":        [185,  82,  42],
            "planter":       [75,   52,  28],
            "string_light":  [255, 215,  95],
        },
        "materials": {
            "hardscape":  "Warm buff stamped concrete / pavers",
            "pergola":    "Western Red Cedar beams",
            "furniture":  "Powder-coat black metal + Sunbrella cushions",
            "fence":      "Horizontal cedar board",
            "accent":     "Terracotta pots, Edison string lights",
        }
    },
    "california_modern": {
        "label": "California Modern",
        "description": "Concrete, steel, drought-tolerant plants, clean geometric lines",
        "colors": {
            "house_wall":    [195, 192, 188],
            "deck":          [110, 108, 105],
            "hardscape":     [175, 170, 162],
            "grass":         [85,  148,  65],
            "fence":         [82,   78,  72],
            "pergola":       [95,   92,  88],
            "furniture":     [45,   44,  42],
            "cushion":       [210, 205, 195],
            "accent":        [78,  128, 185],
            "planter":       [90,   86,  80],
            "string_light":  [255, 220, 120],
        },
        "materials": {
            "hardscape":  "Large-format concrete pavers (24\"×24\")",
            "pergola":    "Steel + ipe wood composite",
            "furniture":  "Aluminum frame + outdoor woven fabric",
            "fence":      "Steel panel or concrete block",
            "accent":     "Weathering steel planters, concrete pots",
        }
    },
    "tropical_resort": {
        "label": "Tropical Resort",
        "description": "Lush greenery, teak furniture, natural stone, bamboo accents",
        "colors": {
            "house_wall":    [235, 228, 210],
            "deck":          [148, 105,  55],
            "hardscape":     [188, 178, 155],
            "grass":         [48,  128,  42],
            "fence":         [72,   58,  35],
            "pergola":       [118,  85,  38],
            "furniture":     [138,  98,  48],
            "cushion":       [238, 232, 218],
            "accent":        [42,  118,  88],
            "planter":       [85,   68,  38],
            "string_light":  [255, 225, 140],
        },
        "materials": {
            "hardscape":  "Natural travertine or coral stone",
            "pergola":    "Teak or bamboo with shade sail",
            "furniture":  "Teak wood + outdoor canvas cushions",
            "fence":      "Bamboo screen + tropical landscaping",
            "accent":     "Oversized tropical plants, rattan lanterns",
        }
    },
    "mediterranean": {
        "label": "Mediterranean",
        "description": "Terracotta, stucco, wrought iron, olive trees, warm earthy tones",
        "colors": {
            "house_wall":    [228, 215, 192],
            "deck":          [175, 148, 105],
            "hardscape":     [205, 185, 152],
            "grass":         [62,  118,  45],
            "fence":         [148, 115,  72],
            "pergola":       [145,  95,  38],
            "furniture":     [62,   48,  28],
            "cushion":       [215, 185, 145],
            "accent":        [192,  68,  32],
            "planter":       [175,  95,  45],
            "string_light":  [255, 210,  95],
        },
        "materials": {
            "hardscape":  "Terracotta or saltillo tile",
            "pergola":    "Rough-hewn wood beams + wisteria",
            "furniture":  "Wrought iron + weather-resistant fabric",
            "fence":      "Stucco wall or wrought iron",
            "accent":     "Hand-painted terracotta, mosaic tile inlays",
        }
    },
    "scandinavian_minimal": {
        "label": "Scandinavian Minimal",
        "description": "Clean lines, light wood, black accents, simple greenery",
        "colors": {
            "house_wall":    [240, 238, 235],
            "deck":          [195, 178, 150],
            "hardscape":     [205, 200, 192],
            "grass":         [88,  155,  70],
            "fence":         [52,   50,  48],
            "pergola":       [175, 148, 108],
            "furniture":     [38,   36,  34],
            "cushion":       [235, 232, 228],
            "accent":        [85,  125, 175],
            "planter":       [68,   65,  60],
            "string_light":  [255, 230, 160],
        },
        "materials": {
            "hardscape":  "Light gray concrete slab, minimal joint lines",
            "pergola":    "Whitewashed pine or light ash",
            "furniture":  "Black powder-coat + light oak accents",
            "fence":      "Black steel or horizontal white cedar",
            "accent":     "Matte black planters, simple grasses",
        }
    },
}

# ═══════════════════════════════════════════════════════════════════════════════
#  ZONE DEFINITIONS
# ═══════════════════════════════════════════════════════════════════════════════
ZONE_TYPES = {
    # Backyard zones
    "bbq_kitchen":   {"label": "BBQ + Outdoor Kitchen", "emoji": "🔥", "type": "hardscape",
                      "description": "Built-in grill, outdoor counter, mini fridge. Add pergola for shade."},
    "dining":        {"label": "Dining + Seating", "emoji": "☀️",  "type": "hardscape",
                      "description": "Outdoor dining table with chairs + lounge seating. String lights overhead."},
    "walkway":       {"label": "Clear Walkway", "emoji": "🚶",  "type": "hardscape",
                      "description": "Open paved passage from door into yard. No obstructions."},
    "open_patio":    {"label": "Open Patio", "emoji": "⬜",  "type": "hardscape",
                      "description": "Flexible hardscape for gatherings, overflow seating, or yard games."},
    "kids_play":     {"label": "Kids Play Area", "emoji": "🛝",  "type": "softscape",
                      "description": "Swing set, slide, sandbox on rubber mulch safety surface."},
    "lawn":          {"label": "Open Lawn", "emoji": "🌱",  "type": "softscape",
                      "description": "Grass for yard games, picnics, or overflow seating."},
    "garden_beds":   {"label": "Garden Beds", "emoji": "🌺",  "type": "planting",
                      "description": "Raised planters with native plants, vegetables, herbs."},
    "pool":          {"label": "Pool / Spa", "emoji": "🏊",  "type": "water",
                      "description": "In-ground or above-ground pool with surround decking."},
    "fire_pit":      {"label": "Fire Pit", "emoji": "🔥",  "type": "hardscape",
                      "description": "Sunken or raised fire pit with seating circle around it."},
    "pergola_lounge":{"label": "Pergola Lounge", "emoji": "🏡",  "type": "structure",
                      "description": "Freestanding pergola with lounge furniture and shade."},
    "storage_shed":  {"label": "Storage Shed", "emoji": "🏠",  "type": "structure",
                      "description": "Weatherproof storage for tools, bikes, garden equipment."},
    "side_yard":     {"label": "Side Yard", "emoji": "📦",  "type": "utility",
                      "description": "Utility strip: trash/recycling, compost, storage access."},
    # Interior zones
    "living_area":   {"label": "Living Area", "emoji": "🛋️",  "type": "interior",
                      "description": "Sofa arrangement around coffee table, entertainment unit."},
    "dining_area":   {"label": "Dining Area", "emoji": "🍽️",  "type": "interior",
                      "description": "Dining table + chairs, lighting above."},
    "kitchen":       {"label": "Kitchen", "emoji": "🍳",  "type": "interior",
                      "description": "Work triangle, island, appliances."},
    "office_nook":   {"label": "Office / Study Nook", "emoji": "💻",  "type": "interior",
                      "description": "Desk, shelving, task lighting."},
    "reading_corner":{"label": "Reading Corner", "emoji": "📚",  "type": "interior",
                      "description": "Armchair, side table, floor lamp, bookshelf."},
}

# ═══════════════════════════════════════════════════════════════════════════════
#  STATE MANAGEMENT
# ═══════════════════════════════════════════════════════════════════════════════
def load_state() -> Dict:
    if STATE_FILE.exists():
        with open(STATE_FILE) as f:
            return json.load(f)
    return {}

def save_state(state: Dict) -> None:
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)

def get_or_empty() -> Dict:
    s = load_state()
    return s if s else {
        "project_name": "Untitled",
        "space_type": "backyard",
        "description": "",
        "style": "modern_farmhouse",
        "dimensions": {"width_ft": 40, "depth_ft": 35},
        "existing_features": [],
        "zones": [],
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }

# ═══════════════════════════════════════════════════════════════════════════════
#  TOOLS
# ═══════════════════════════════════════════════════════════════════════════════

class StartProjectInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    project_name:       str  = Field(..., description="Name for this project, e.g. 'Backyard Satya' or 'Living Room Reno'")
    space_type:         str  = Field(..., description="Type of space: 'backyard' or 'interior'")
    description:        str  = Field(..., description="Describe the space: dimensions, existing features, goals. E.g. '40ft wide x 35ft deep backyard with existing gray composite deck, stamped concrete patio, palm trees on left. Want BBQ area, kids play zone, seating.'")
    style:              str  = Field(default="modern_farmhouse", description="Design style: modern_farmhouse | california_modern | tropical_resort | mediterranean | scandinavian_minimal")
    width_ft:           float = Field(default=40.0, description="Width of the space in feet", ge=5, le=300)
    depth_ft:           float = Field(default=35.0, description="Depth of the space in feet", ge=5, le=300)

@mcp.tool(name="design_start_project",
          annotations={"title": "Start a Design Project", "readOnlyHint": False, "destructiveHint": False})
async def design_start_project(params: StartProjectInput) -> str:
    """Start a new design project for a backyard or interior space.

    Creates a new project with the given description and style. Call this first before
    adding zones or rendering. Saves state to ~/Documents/DesignAgent/current_project.json.

    Args:
        params: Project setup including name, space type, description, style, and dimensions.

    Returns:
        Confirmation string with project summary and next steps.
    """
    style = params.style if params.style in STYLES else "modern_farmhouse"
    state = {
        "project_name": params.project_name,
        "space_type":   params.space_type,
        "description":  params.description,
        "style":        style,
        "dimensions":   {"width_ft": params.width_ft, "depth_ft": params.depth_ft},
        "existing_features": _parse_existing_features(params.description),
        "zones":        [],
        "created_at":   datetime.now().isoformat(),
        "updated_at":   datetime.now().isoformat(),
    }
    save_state(state)
    palette = STYLES[style]
    return (
        f"✅ Project '{params.project_name}' created!\n\n"
        f"Space:  {params.space_type}  ·  {params.width_ft}ft × {params.depth_ft}ft\n"
        f"Style:  {palette['label']} — {palette['description']}\n\n"
        f"Detected existing features: {', '.join(state['existing_features']) or 'none described'}\n\n"
        f"Next steps:\n"
        f"  1. Call design_update_zone to add zones (BBQ, seating, play area, etc.)\n"
        f"  2. Call design_render to generate the visual PNG\n"
        f"  3. Call design_list_zones to see all available zone types"
    )

def _parse_existing_features(desc: str) -> List[str]:
    """Extract existing features mentioned in a description string."""
    keywords = {
        "deck": "existing deck", "patio": "existing patio", "concrete": "existing concrete",
        "pool": "existing pool", "fence": "existing fence", "tree": "existing trees",
        "palm": "palm trees", "grass": "existing lawn", "pergola": "existing pergola",
        "shed": "existing shed", "string light": "string lights",
    }
    desc_lower = desc.lower()
    return [v for k, v in keywords.items() if k in desc_lower]


class UpdateZoneInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    zone_type:    str   = Field(..., description="Zone type key, e.g. 'bbq_kitchen', 'kids_play', 'dining', 'lawn', 'garden_beds'. Call design_list_zones to see all options.")
    position:     str   = Field(..., description="Where in the space: 'back_left' | 'back_center' | 'back_right' | 'center_left' | 'center' | 'center_right' | 'front_left' | 'front_center' | 'front_right'")
    size:         str   = Field(default="medium", description="Relative size: 'small' | 'medium' | 'large'")
    notes:        Optional[str] = Field(default=None, description="Any extra notes for this zone, e.g. 'near kitchen window' or 'with shade sail'")

@mcp.tool(name="design_update_zone",
          annotations={"title": "Add or Update a Zone", "readOnlyHint": False, "destructiveHint": False})
async def design_update_zone(params: UpdateZoneInput) -> str:
    """Add or update a zone in the current design project.

    Zones define what goes where: BBQ kitchen, seating, play area, garden beds, etc.
    Call multiple times to build up the full layout. If the same zone_type already exists
    in the same position it will be updated, otherwise a new zone is added.

    Args:
        params: Zone type, position, size, and optional notes.

    Returns:
        Confirmation with the updated zone list.
    """
    if params.zone_type not in ZONE_TYPES:
        avail = ", ".join(ZONE_TYPES.keys())
        return f"Error: Unknown zone type '{params.zone_type}'. Available: {avail}"

    state = get_or_empty()
    zone_def = ZONE_TYPES[params.zone_type]
    new_zone = {
        "type":     params.zone_type,
        "label":    zone_def["label"],
        "emoji":    zone_def["emoji"],
        "position": params.position,
        "size":     params.size,
        "notes":    params.notes or "",
    }
    # Replace if same type+position, else append
    replaced = False
    for i, z in enumerate(state["zones"]):
        if z["type"] == params.zone_type and z["position"] == params.position:
            state["zones"][i] = new_zone
            replaced = True
            break
    if not replaced:
        state["zones"].append(new_zone)
    state["updated_at"] = datetime.now().isoformat()
    save_state(state)

    zone_list = "\n".join(
        f"  {z['emoji']} {z['label']} [{z['position']}] ({z['size']})"
        for z in state["zones"]
    )
    action = "Updated" if replaced else "Added"
    return (
        f"✅ {action}: {zone_def['emoji']} {zone_def['label']} at {params.position} ({params.size})\n\n"
        f"Current zones ({len(state['zones'])}):\n{zone_list}\n\n"
        f"Call design_render to generate the visual."
    )


class SetStyleInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    style: str = Field(..., description="Style key: modern_farmhouse | california_modern | tropical_resort | mediterranean | scandinavian_minimal")

@mcp.tool(name="design_set_style",
          annotations={"title": "Set Design Style", "readOnlyHint": False, "destructiveHint": False})
async def design_set_style(params: SetStyleInput) -> str:
    """Change the design style (color palette + materials) for the current project.

    Does not change the zones — only updates the visual style applied during rendering.
    Call design_render after changing the style to see the new look.

    Args:
        params: The style key to apply.

    Returns:
        Confirmation with palette details.
    """
    if params.style not in STYLES:
        avail = "\n".join(f"  • {k}: {v['label']} — {v['description']}" for k, v in STYLES.items())
        return f"Error: Unknown style '{params.style}'.\n\nAvailable styles:\n{avail}"
    state = get_or_empty()
    state["style"] = params.style
    state["updated_at"] = datetime.now().isoformat()
    save_state(state)
    palette = STYLES[params.style]
    mats = "\n".join(f"  • {k}: {v}" for k, v in palette["materials"].items())
    return (
        f"✅ Style set to: {palette['label']}\n"
        f"{palette['description']}\n\n"
        f"Materials:\n{mats}\n\n"
        f"Call design_render to see the updated look."
    )


class RenderInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    filename: Optional[str] = Field(default=None, description="Output filename (no extension). Defaults to project name.")
    show_palette: bool = Field(default=True, description="Include material palette panel on the right side")
    show_dimensions: bool = Field(default=True, description="Show dimension annotations on the plan")

@mcp.tool(name="design_render",
          annotations={"title": "Render Design Visual", "readOnlyHint": True, "destructiveHint": False})
async def design_render(params: RenderInput) -> str:
    """Render the current design project as a high-quality PNG image.

    Generates a professional floor plan with realistic material colors, zone labels,
    material palette swatches, and color story. Output saved to ~/Documents/DesignAgent/renders/.

    Args:
        params: Output filename options and what panels to include.

    Returns:
        Path to the rendered PNG file.
    """
    if not PIL_AVAILABLE:
        return "Error: Pillow not installed. Run: pip install Pillow"

    state = get_or_empty()
    if not state.get("zones"):
        return "Error: No zones defined. Call design_update_zone first to add zones."

    name = params.filename or state.get("project_name", "design").replace(" ", "_")
    out_path = OUTPUT_DIR / f"{name}.png"

    try:
        _render_design(state, str(out_path), params.show_palette, params.show_dimensions)
        return f"✅ Rendered: {out_path}\n\nOpen the file to see your design."
    except Exception as e:
        import traceback
        return f"Error rendering: {e}\n{traceback.format_exc()}"


class GetProjectInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

@mcp.tool(name="design_get_project",
          annotations={"title": "Get Current Project State", "readOnlyHint": True, "destructiveHint": False, "idempotentHint": True})
async def design_get_project(params: GetProjectInput) -> str:
    """View the current design project state as JSON.

    Returns all project details: name, style, dimensions, existing features, and all zones.

    Returns:
        JSON string of the current project.
    """
    state = get_or_empty()
    return json.dumps(state, indent=2)


class ListStylesInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

@mcp.tool(name="design_list_styles",
          annotations={"title": "List Available Design Styles", "readOnlyHint": True, "idempotentHint": True, "destructiveHint": False})
async def design_list_styles(params: ListStylesInput) -> str:
    """List all available design styles with descriptions and material palettes.

    Returns:
        Formatted list of all styles, descriptions, and key materials.
    """
    lines = ["# Available Design Styles\n"]
    for key, s in STYLES.items():
        lines.append(f"## {s['label']}  (key: `{key}`)")
        lines.append(f"{s['description']}\n")
        lines.append("Materials:")
        for mk, mv in s["materials"].items():
            lines.append(f"  • {mk}: {mv}")
        lines.append("")
    return "\n".join(lines)


class ListZonesInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    space_type: str = Field(default="backyard", description="Filter by space type: 'backyard' | 'interior' | 'all'")

@mcp.tool(name="design_list_zones",
          annotations={"title": "List Available Zone Types", "readOnlyHint": True, "idempotentHint": True, "destructiveHint": False})
async def design_list_zones(params: ListZonesInput) -> str:
    """List all available zone types with descriptions.

    Use zone type keys when calling design_update_zone.

    Args:
        params: Filter by space_type (backyard, interior, or all).

    Returns:
        Formatted list of all zones with keys and descriptions.
    """
    interior_keys = {"living_area", "dining_area", "kitchen", "office_nook", "reading_corner"}
    backyard_keys = set(ZONE_TYPES.keys()) - interior_keys
    lines = ["# Available Zone Types\n"]
    groups = []
    if params.space_type in ("backyard", "all"):
        groups.append(("Backyard Zones", backyard_keys))
    if params.space_type in ("interior", "all"):
        groups.append(("Interior Zones", interior_keys))
    for group_name, keys in groups:
        lines.append(f"## {group_name}")
        for k in keys:
            z = ZONE_TYPES[k]
            lines.append(f"  {z['emoji']}  `{k}` — {z['label']}")
            lines.append(f"     {z['description']}")
        lines.append("")
    lines.append("Positions: back_left | back_center | back_right | center_left | center | center_right | front_left | front_center | front_right")
    lines.append("Sizes: small | medium | large")
    return "\n".join(lines)


class ResetInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

@mcp.tool(name="design_reset",
          annotations={"title": "Reset Current Project", "readOnlyHint": False, "destructiveHint": True})
async def design_reset(params: ResetInput) -> str:
    """Clear the current design project and start fresh.

    Returns:
        Confirmation message.
    """
    if STATE_FILE.exists():
        STATE_FILE.unlink()
    return "✅ Project reset. Call design_start_project to begin a new design."


# ═══════════════════════════════════════════════════════════════════════════════
#  RENDERER
# ═══════════════════════════════════════════════════════════════════════════════

def _font(name: str, size: int):
    """Load font from FONT_DIR or fall back to default."""
    if not PIL_AVAILABLE:
        return None
    path = FONT_DIR / name
    try:
        return ImageFont.truetype(str(path), size)
    except Exception:
        try:
            return ImageFont.load_default()
        except Exception:
            return None

def _color(state: Dict, key: str, fallback=(150,150,150)) -> tuple:
    style_key = state.get("style", "modern_farmhouse")
    palette = STYLES.get(style_key, STYLES["modern_farmhouse"])["colors"]
    c = palette.get(key, fallback)
    return tuple(c)

def _fill_grass(draw, x0, y0, x1, y1, color, seed=0):
    rng = random.Random(seed)
    draw.rectangle([x0, y0, x1, y1], fill=color)
    dark  = tuple(max(0, c-20) for c in color)
    light = tuple(min(255, c+18) for c in color)
    for i in range((y1-y0)//3):
        y = y0 + i*3
        if rng.random() > 0.5:
            c = dark if rng.random() > 0.5 else light
            draw.line([x0, y, x1, y], fill=c)

def _fill_pavers(draw, x0, y0, x1, y1, color, cw=48, ch=40):
    draw.rectangle([x0, y0, x1, y1], fill=color)
    joint = tuple(max(0, c-20) for c in color)
    hi    = tuple(min(255, c+15) for c in color)
    r = 0
    y = y0
    while y <= y1:
        off = (cw//2) if r%2 else 0
        x = x0 + off
        while x <= x1:
            draw.rectangle([x, y, min(x+cw-2,x1), min(y+ch-2,y1)], outline=joint, width=1)
            draw.line([x, y, x+min(cw-3,x1-x), y], fill=hi, width=1)
            x += cw
        y += ch
        r += 1

def _render_design(state: Dict, out_path: str, show_palette: bool, show_dims: bool):
    """Core renderer — draws the floor plan and optional palette panel."""
    from PIL import Image, ImageDraw

    W = 3000 if show_palette else 1900
    H = 2000
    img = Image.new("RGB", (W, H), (242, 238, 231))
    draw = ImageDraw.Draw(img)

    # Background subtle gradient
    for y in range(0, H, 3):
        v = 242 - int((y/H)*10)
        draw.line([0, y, W, y], fill=(v, v-4, v-11))

    # Palette refs
    grass_c   = _color(state, "grass")
    hard_c    = _color(state, "hardscape")
    fence_c   = _color(state, "fence")
    perg_c    = _color(state, "pergola")
    furn_c    = _color(state, "furniture")
    cush_c    = _color(state, "cushion")
    accent_c  = _color(state, "accent")
    plant_c   = _color(state, "planter")
    light_c   = _color(state, "string_light")
    house_c   = _color(state, "house_wall")

    # ── Header ──────────────────────────────────────────────────────────────
    draw.rectangle([0, 0, W, 110], fill=(24, 22, 18))
    f_title = _font("Gloock-Regular.ttf", 48)
    f_sub   = _font("InstrumentSans-Regular.ttf", 20)
    f_small = _font("InstrumentSans-Regular.ttf", 15)
    f_label = _font("InstrumentSans-Bold.ttf", 17)
    f_zone  = _font("WorkSans-Bold.ttf", 20)
    f_note  = _font("InstrumentSans-Italic.ttf", 14)
    f_h2    = _font("Gloock-Regular.ttf", 30)
    f_mat   = _font("WorkSans-Bold.ttf", 17)

    project_name = state.get("project_name", "Design")
    style_label  = STYLES.get(state.get("style","modern_farmhouse"),{}).get("label","")
    dims = state.get("dimensions", {})
    w_ft = dims.get("width_ft", 40)
    d_ft = dims.get("depth_ft", 35)
    draw.text((65, 22), f"DESIGN PLAN — {project_name.upper()}", font=f_title, fill=(235,228,212))
    draw.text((67, 78), f"Style: {style_label}  ·  {w_ft}ft × {d_ft}ft  ·  {state.get('space_type','backyard').title()}", font=f_sub, fill=(165,155,138))
    draw.text((W-280, 78), datetime.now().strftime("%B %Y"), font=f_small, fill=(120,112,98))

    # ── Plan area ───────────────────────────────────────────────────────────
    PL = 60; PT = 128; PW = 1700 if show_palette else W-120; PH = 1800
    YARD_T = PT + 35
    YARD_B = PT + PH - 170
    HOUSE_T = YARD_B
    HOUSE_B = PT + PH

    # Back fence label
    draw.rectangle([PL, YARD_T-36, PL+PW, YARD_T-2], fill=(48,72,32))
    draw.text((PL+PW//2-160, YARD_T-28), "▲  BACK FENCE  ·  Views beyond", font=f_small, fill=(195,230,175))

    # Compute position grid (3×3 grid over yard)
    YARD_H = YARD_B - YARD_T
    col_w  = PW // 3
    row_h  = YARD_H // 3
    pos_map = {
        "back_left":     (PL,           YARD_T),
        "back_center":   (PL+col_w,     YARD_T),
        "back_right":    (PL+col_w*2,   YARD_T),
        "center_left":   (PL,           YARD_T+row_h),
        "center":        (PL+col_w,     YARD_T+row_h),
        "center_right":  (PL+col_w*2,   YARD_T+row_h),
        "front_left":    (PL,           YARD_T+row_h*2),
        "front_center":  (PL+col_w,     YARD_T+row_h*2),
        "front_right":   (PL+col_w*2,   YARD_T+row_h*2),
    }
    size_map = {"small": 0.55, "medium": 0.82, "large": 0.96}

    # Background: fill unclaimed cells with grass
    _fill_grass(draw, PL, YARD_T, PL+PW, YARD_B, grass_c, seed=42)

    # Draw each zone
    zones = state.get("zones", [])
    for zone in zones:
        ztype = zone.get("type", "")
        pos   = zone.get("position", "center")
        size  = zone.get("size", "medium")
        sx, sy = pos_map.get(pos, (PL+col_w, YARD_T+row_h))
        factor = size_map.get(size, 0.82)
        pad = int(col_w * (1-factor) / 2)
        zx0, zy0 = sx+pad, sy+pad
        zx1 = sx + col_w - pad
        zy1 = sy + row_h - pad
        _draw_zone(draw, ztype, zx0, zy0, zx1, zy1, state,
                   grass_c, hard_c, fence_c, perg_c, furn_c, cush_c, accent_c, plant_c, light_c,
                   f_zone, f_note, f_label)

    # House wall
    draw.rectangle([PL, HOUSE_T, PL+PW, HOUSE_B], fill=house_c)
    house_dark  = tuple(max(0, c-15) for c in house_c)
    house_light = tuple(min(255, c+15) for c in house_c)
    draw.rectangle([PL, HOUSE_T, PL+PW, HOUSE_T+6], fill=house_light)
    for bx in range(PL+25, PL+PW, 30):
        draw.line([bx, HOUSE_T, bx, HOUSE_B], fill=house_dark, width=2)
    # Door (center)
    door_w = 150
    door_cx = PL + PW//2
    draw.rectangle([door_cx-door_w//2, HOUSE_T, door_cx+door_w//2, HOUSE_B-4],
                   fill=(170,202,226), outline=(100,140,175), width=3)
    draw.line([door_cx, HOUSE_T, door_cx, HOUSE_B-4], fill=(100,140,175), width=2)
    draw.text((door_cx-40, HOUSE_T+52), "BACK DOOR", font=_font("InstrumentSans-Bold.ttf",14), fill=(42,58,78))
    # Windows
    for woff in [-400, -250, -120, 160, 300, 450]:
        wx = door_cx + woff
        if PL < wx < PL+PW-60:
            draw.rectangle([wx, HOUSE_T+18, wx+55, HOUSE_T+72], fill=(170,202,226), outline=house_dark, width=2)
    draw.text((PL+PW//2-120, HOUSE_T+100), f"HOUSE  ·  {project_name}", font=f_label, fill=(75,70,62))

    # Fence lines (sides)
    for fx in [PL, PL+PW]:
        draw.line([fx, YARD_T, fx, YARD_B], fill=fence_c, width=6)
        draw.line([fx+3, YARD_T, fx+3, YARD_B] if fx==PL else [fx-3, YARD_T, fx-3, YARD_B],
                  fill=tuple(min(255,c+20) for c in fence_c), width=2)

    # Dimension annotations
    if show_dims:
        ann_y = HOUSE_B + 25
        draw.line([PL, ann_y, PL+PW, ann_y], fill=(100,90,80), width=1)
        draw.line([PL, ann_y-5, PL, ann_y+5], fill=(100,90,80), width=2)
        draw.line([PL+PW, ann_y-5, PL+PW, ann_y+5], fill=(100,90,80), width=2)
        draw.text((PL+PW//2-50, ann_y+8), f"~{int(w_ft)} ft wide", font=f_small, fill=(100,90,80))
        # Depth
        ann_x = PL - 42
        draw.line([ann_x, YARD_T, ann_x, YARD_B], fill=(100,90,80), width=1)
        draw.text((ann_x-30, (YARD_T+YARD_B)//2-30), f"~{int(d_ft)}ft", font=f_small, fill=(100,90,80))

    # ── Footer ──────────────────────────────────────────────────────────────
    draw.rectangle([0, H-42, W, H], fill=(24,22,18))
    draw.text((65, H-28), f"Design Agent  ·  {project_name}  ·  {style_label}", font=f_small, fill=(155,145,130))

    # ── Palette panel ────────────────────────────────────────────────────────
    if show_palette:
        _draw_palette_panel(draw, state, PL+PW+50, W, PT, H, f_h2, f_mat, f_label, f_small, f_note)

    img.save(out_path, "PNG", dpi=(180, 180))


def _draw_zone(draw, ztype, x0, y0, x1, y1, state,
               grass_c, hard_c, fence_c, perg_c, furn_c, cush_c, accent_c, plant_c, light_c,
               f_zone, f_note, f_label):
    """Draw a single zone into the plan."""
    cx, cy = (x0+x1)//2, (y0+y1)//2
    f_tiny = _font("InstrumentSans-Regular.ttf", 12)

    if ztype == "bbq_kitchen":
        # Pergola background
        draw.rectangle([x0,y0,x1,y1], fill=tuple(max(0,c-30) for c in perg_c))
        bstep = max(20, (y1-y0)//8)
        for by in range(y0, y1, bstep):
            draw.rectangle([x0, by, x1, by+max(8,(y1-y0)//14)], fill=perg_c)
            draw.rectangle([x0, by+1, x1, by+4], fill=tuple(min(255,c+30) for c in perg_c))
        # Grill
        gw = min(80, (x1-x0)//3)
        draw.rectangle([x0+12, y0+30, x0+12+gw, y0+30+50], fill=(50,48,44))
        draw.rectangle([x0+15, y0+33, x0+9+gw, y0+55], fill=(68,65,60))
        for gi in range(5):
            draw.line([x0+16, y0+37+gi*4, x0+8+gw, y0+37+gi*4], fill=(80,78,74), width=1)
        # Counter
        draw.rectangle([x0+gw+22, y0+28, x1-12, y0+80], fill=tuple(max(0,c-15) for c in perg_c))
        draw.rectangle([x0+gw+20, y0+26, x1-10, y0+40], fill=(50,48,44))
        # Label
        draw.text((cx-65, y1-48), "🔥 BBQ + KITCHEN", font=f_zone, fill=(235,210,165))
        draw.text((cx-58, y1-26), "grill · counter · pergola", font=f_note, fill=(205,185,145))

    elif ztype == "dining":
        _fill_pavers(draw, x0, y0, x1, y1, hard_c)
        # String lights
        for sx in range(x0+15, x1-15, 32):
            draw.ellipse([sx-3, y0+10, sx+3, y0+16], fill=light_c)
        draw.line([x0+5, y0+13, x1-5, y0+13], fill=(160,140,80), width=1)
        # Table
        tr = min(55, (x1-x0)//4, (y1-y0)//4)
        draw.ellipse([cx-tr, cy-tr//2, cx+tr, cy+tr//2], fill=tuple(max(0,c-20) for c in furn_c))
        draw.ellipse([cx-tr+6, cy-tr//2+4, cx+tr-4, cy+tr//2-4], fill=tuple(min(255,c+15) for c in furn_c))
        # Chairs
        for cpos in [(cx-tr-28, cy-14), (cx+tr+4, cy-14), (cx-22, cy-tr//2-26), (cx-22, cy+tr//2+6)]:
            draw.rectangle([cpos[0], cpos[1], cpos[0]+30, cpos[1]+22], fill=furn_c)
            draw.rectangle([cpos[0]+2, cpos[1]+2, cpos[0]+28, cpos[1]+10], fill=cush_c)
        draw.text((cx-72, y1-46), "☀️ DINING + SEATING", font=f_zone, fill=(215,190,138))
        draw.text((cx-52, y1-24), "table · chairs · lights", font=f_note, fill=(188,168,125))

    elif ztype == "walkway":
        _fill_pavers(draw, x0, y0, x1, y1, hard_c, cw=58, ch=58)
        draw.rectangle([x0, y0, x1, y0+2], fill=tuple(max(0,c-20) for c in hard_c))
        for ax in [cx-50, cx, cx+50]:
            if x0 < ax < x1:
                draw.line([ax, y1-8, ax, y0+12], fill=(120,108,92), width=2)
                draw.polygon([(ax-5,y0+20),(ax+5,y0+20),(ax,y0+10)], fill=(120,108,92))
        draw.text((cx-78, cy-12), "🚶 CLEAR WALKWAY", font=f_zone, fill=(90,82,70))
        draw.text((cx-55, cy+12), "open from door", font=f_note, fill=(110,100,82))

    elif ztype == "open_patio":
        _fill_pavers(draw, x0, y0, x1, y1, hard_c)
        # Terracotta pots
        for px_, py_ in [(x0+18, y0+18), (x1-30, y0+18)]:
            draw.ellipse([px_, py_, px_+16, py_+20], fill=accent_c)
            draw.ellipse([px_+3, py_-8, px_+13, py_+4], fill=(48,120,55))
        draw.text((cx-65, cy-12), "⬜ OPEN PATIO", font=f_zone, fill=(95,88,75))
        draw.text((cx-72, cy+12), "gatherings · overflow", font=f_note, fill=(115,105,88))

    elif ztype == "kids_play":
        # Rubber mulch
        draw.rectangle([x0,y0,x1,y1], fill=(165,132,82))
        draw.rectangle([x0,y0,x1,y1], fill=None, outline=(140,108,65), width=2)
        # Swing
        sw_cx = x0 + (x1-x0)//4
        sw_t, sw_b = y0+20, y0+20+80
        draw.line([sw_cx-40, sw_t, sw_cx, sw_b], fill=(110,75,30), width=4)
        draw.line([sw_cx+40, sw_t, sw_cx, sw_b], fill=(110,75,30), width=4)
        draw.line([sw_cx-42, sw_t-2, sw_cx+42, sw_t-2], fill=(110,75,30), width=4)
        draw.rectangle([sw_cx-18, sw_b-15, sw_cx+18, sw_b-5], fill=(72,50,25))
        # Sandbox
        sb_x0, sb_y0_ = x0+14, y0+(y1-y0)//2+10
        draw.rectangle([sb_x0, sb_y0_, sb_x0+90, sb_y0_+55], fill=(148,112,60), outline=(105,75,38), width=3)
        draw.rectangle([sb_x0+4, sb_y0_+4, sb_x0+86, sb_y0_+51], fill=(210,185,130))
        draw.text((sb_x0+10, sb_y0_+20), "SANDBOX", font=f_tiny, fill=(95,68,30))
        draw.text((cx-55, y1-46), "🛝 KIDS PLAY", font=f_zone, fill=(36,75,155))
        draw.text((cx-65, y1-24), "swing · slide · sandbox", font=f_note, fill=(55,100,175))

    elif ztype == "lawn":
        _fill_grass(draw, x0, y0, x1, y1, grass_c, seed=99)
        draw.rectangle([x0, y0, x1, y1], fill=None, outline=tuple(max(0,c-25) for c in grass_c), width=2)
        draw.text((cx-55, cy-12), "🌱 OPEN LAWN", font=f_zone, fill=(38,90,32))
        draw.text((cx-60, cy+12), "games · overflow", font=f_note, fill=(62,115,48))

    elif ztype == "garden_beds":
        draw.rectangle([x0, y0, x1, y1], fill=(38,65,28))
        # Planters
        bed_h = (y1-y0-20)//2
        draw.rectangle([x0+10, y0+8, x1-10, y0+8+bed_h], fill=plant_c)
        draw.rectangle([x0+14, y0+12, x1-14, y0+8+bed_h-4], fill=(48,38,24))
        draw.rectangle([x0+10, y0+14+bed_h, x1-10, y1-10], fill=plant_c)
        draw.rectangle([x0+14, y0+18+bed_h, x1-14, y1-14], fill=(48,38,24))
        # Plants
        rng = random.Random(55)
        for i in range(6):
            px_ = x0 + 20 + i*(x1-x0-40)//6
            py_ = y0 + (y1-y0)//3
            r = rng.randint(9,16)
            c = (28,90,42) if i%3!=2 else (148,112,188)
            draw.ellipse([px_-r, py_-r//2, px_+r, py_+r//2], fill=c)
        draw.text((cx-70, y1-46), "🌺 GARDEN BEDS", font=f_zone, fill=(195,228,175))
        draw.text((cx-68, y1-24), "native plants · herbs", font=f_note, fill=(160,200,145))

    elif ztype == "fire_pit":
        _fill_pavers(draw, x0, y0, x1, y1, hard_c)
        # Fire pit circle
        fpr = min(42, (x1-x0)//5, (y1-y0)//5)
        draw.ellipse([cx-fpr, cy-fpr, cx+fpr, cy+fpr], fill=(75,68,60))
        draw.ellipse([cx-fpr+5, cy-fpr+5, cx+fpr-5, cy+fpr-5], fill=(95,55,30))
        draw.ellipse([cx-fpr+14, cy-fpr+14, cx+fpr-14, cy+fpr-14], fill=(185,80,25))
        # Chairs in circle
        for ang in [0, 90, 180, 270]:
            r_ang = math.radians(ang)
            chx = int(cx + math.cos(r_ang)*(fpr+28))
            chy = int(cy + math.sin(r_ang)*(fpr+28))
            draw.rectangle([chx-14, chy-12, chx+14, chy+12], fill=furn_c)
            draw.rectangle([chx-12, chy-10, chx+12, chy-3], fill=cush_c)
        draw.text((cx-60, y1-46), "🔥 FIRE PIT", font=f_zone, fill=(215,160,80))
        draw.text((cx-58, y1-24), "seating circle", font=f_note, fill=(188,140,68))

    elif ztype in ("pool",):
        draw.rectangle([x0, y0, x1, y1], fill=(100,165,210))
        draw.rectangle([x0+8, y0+8, x1-8, y1-8], fill=(120,185,228))
        # Tiles
        for ty in range(y0+2, y1-2, 18):
            draw.line([x0+2, ty, x1-2, ty], fill=(90,155,200), width=1)
        draw.text((cx-38, cy-12), "🏊 POOL", font=f_zone, fill=(38,92,145))
        draw.text((cx-52, cy+12), "in-ground pool", font=f_note, fill=(55,115,172))

    elif ztype == "pergola_lounge":
        draw.rectangle([x0, y0, x1, y1], fill=tuple(max(0,c-25) for c in perg_c))
        bstep = max(20, (y1-y0)//6)
        for by in range(y0, y1, bstep):
            draw.rectangle([x0, by, x1, by+max(9,(y1-y0)//12)], fill=perg_c)
        # Lounge chairs
        for lx in [x0+20, cx+10]:
            draw.rectangle([lx, cy-18, lx+55, cy+18], fill=furn_c)
            draw.rectangle([lx+3, cy-16, lx+52, cy-5], fill=cush_c)
        draw.text((cx-70, y1-46), "🏡 PERGOLA LOUNGE", font=f_zone, fill=(225,200,155))
        draw.text((cx-55, y1-24), "lounge · shade", font=f_note, fill=(195,175,130))

    elif ztype == "storage_shed":
        draw.rectangle([x0, y0, x1, y1], fill=tuple(max(0,c-10) for c in hard_c))
        # Shed outline
        sw_ = min(x1-x0-30, 110)
        sh_ = min(y1-y0-30, 90)
        sx_ = cx - sw_//2
        sy_ = cy - sh_//2
        draw.rectangle([sx_, sy_, sx_+sw_, sy_+sh_], fill=(100,80,50))
        draw.polygon([(sx_,sy_),(sx_+sw_//2,sy_-25),(sx_+sw_,sy_)], fill=(80,62,38))
        draw.rectangle([sx_+sw_//2-12, sy_+sh_-35, sx_+sw_//2+12, sy_+sh_], fill=(65,50,30))
        draw.text((cx-55, y1-46), "🏠 STORAGE", font=f_zone, fill=(120,100,72))
        draw.text((cx-42, y1-24), "shed · tools", font=f_note, fill=(100,82,58))

    elif ztype == "side_yard":
        draw.rectangle([x0, y0, x1, y1], fill=tuple(min(255,c+8) for c in hard_c))
        draw.rectangle([x0, y0, x1, y1], fill=None, outline=fence_c, width=3)
        # Trash bins
        for bi, bx_ in enumerate([x0+12, x0+40]):
            draw.rectangle([bx_, cy-18, bx_+20, cy+22], fill=(60,60,65))
            draw.rectangle([bx_-2, cy-22, bx_+22, cy-16], fill=(50,50,55))
        draw.text((cx-42, y1-46), "📦 SIDE YARD", font=f_zone, fill=(105,95,80))
        draw.text((cx-42, y1-24), "utility + storage", font=f_note, fill=(120,108,90))

    elif ztype == "living_area":
        _fill_pavers(draw, x0, y0, x1, y1, hard_c)
        # Sofa (L-shape)
        draw.rectangle([x0+10, y0+10, x1-50, y0+50], fill=furn_c)
        draw.rectangle([x0+10, y0+50, x0+50, cy+20], fill=furn_c)
        draw.rectangle([x0+12, y0+12, x1-52, y0+30], fill=cush_c)
        # Coffee table
        draw.rectangle([cx-30, cy-20, cx+30, cy+20], fill=tuple(max(0,c-20) for c in furn_c))
        draw.text((cx-68, y1-46), "🛋️ LIVING AREA", font=f_zone, fill=(215,190,138))
        draw.text((cx-50, y1-24), "sofa · coffee table", font=f_note, fill=(188,165,120))

    else:
        # Generic zone
        draw.rectangle([x0, y0, x1, y1], fill=tuple(min(255,c+20) for c in hard_c), outline=fence_c, width=2)
        z_info = ZONE_TYPES.get(ztype, {})
        emoji  = z_info.get("emoji", "⬜")
        label  = z_info.get("label", ztype)
        draw.text((cx-len(label)*5, cy-10), f"{emoji} {label}", font=f_zone, fill=(50,44,38))


def _draw_palette_panel(draw, state, px, W, PT, H, f_h2, f_mat, f_label, f_small, f_note):
    """Draw the right-hand material palette panel."""
    ry = PT + 8
    f_tiny = _font("InstrumentSans-Regular.ttf", 12)

    draw.text((px, ry), "MATERIAL PALETTE", font=f_h2, fill=(35,30,24))
    draw.line([px, ry+40, W-50, ry+40], fill=(165,155,140), width=1)
    ry += 55

    style_key = state.get("style", "modern_farmhouse")
    palette = STYLES.get(style_key, STYLES["modern_farmhouse"])
    colors  = palette["colors"]
    mats    = palette["materials"]

    # Material swatches
    swatch_groups = [
        ("HARDSCAPE",  ["hardscape"], "hardscape"),
        ("DECK/FLOOR", ["deck"],      "deck"),
        ("PERGOLA",    ["pergola"],   "pergola"),
        ("FURNITURE",  ["furniture","cushion"], "furniture"),
        ("PLANTS",     [], "accent"),
        ("FENCE",      ["fence"],     "fence"),
        ("ACCENT",     ["accent"],    "accent"),
    ]
    mat_keys = ["hardscape","pergola","furniture","fence","accent"]
    for mk in mat_keys:
        if mk not in mats:
            continue
        col = colors.get(mk, [180,175,168])
        col_t = tuple(col)
        sw_w = 65
        draw.rectangle([px, ry, px+sw_w, ry+40], fill=col_t)
        draw.rectangle([px, ry, px+sw_w, ry+40], fill=None, outline=(200,190,178), width=1)
        tc = (240,235,228) if sum(col)<400 else (35,30,24)
        draw.text((px+4, ry+27), mk, font=f_tiny, fill=tc)
        draw.text((px+sw_w+12, ry+2), mk.upper(), font=f_mat, fill=(35,30,24))
        draw.text((px+sw_w+12, ry+22), mats[mk], font=f_small, fill=(105,95,82))
        draw.line([px, ry+48, W-50, ry+48], fill=(215,208,195), width=1)
        ry += 56

    # Color chips
    ry += 12
    draw.text((px, ry), "COLOR STORY", font=f_h2, fill=(35,30,24))
    draw.line([px, ry+38, W-50, ry+38], fill=(165,155,140), width=1)
    ry += 52
    chips_per_row = 4
    cw = (W - px - 60) // chips_per_row - 5
    ch = 52
    color_keys = list(colors.keys())
    color_labels = {
        "house_wall": "House Wall", "deck": "Deck/Floor", "hardscape": "Hardscape",
        "grass": "Turf/Lawn", "fence": "Fence", "pergola": "Pergola/Wood",
        "furniture": "Furniture", "cushion": "Cushion", "accent": "Accent",
        "planter": "Planters", "string_light": "Lights",
    }
    for ci, ck in enumerate(color_keys):
        row_i  = ci // chips_per_row
        col_i  = ci %  chips_per_row
        cx0 = px + col_i*(cw+5)
        cy0 = ry + row_i*(ch+28)
        col = tuple(colors[ck])
        draw.rectangle([cx0, cy0, cx0+cw, cy0+ch], fill=col)
        draw.rectangle([cx0, cy0, cx0+cw, cy0+ch], fill=None, outline=(200,192,180), width=1)
        tc = (238,232,220) if sum(col)<400 else (35,30,24)
        draw.text((cx0+4, cy0+34), color_labels.get(ck,ck), font=f_tiny, fill=tc)

    ry += (len(color_keys)//chips_per_row + 1)*(ch+28) + 20

    # Zone summary
    draw.text((px, ry), "ZONE SUMMARY", font=f_h2, fill=(35,30,24))
    draw.line([px, ry+38, W-50, ry+38], fill=(165,155,140), width=1)
    ry += 52
    for zone in state.get("zones", []):
        z_info = ZONE_TYPES.get(zone["type"], {})
        emoji  = zone.get("emoji", z_info.get("emoji","⬜"))
        label  = zone.get("label", z_info.get("label", zone["type"]))
        pos    = zone.get("position","")
        size   = zone.get("size","medium")
        notes  = zone.get("notes","")
        draw.text((px, ry), f"{emoji}  {label}", font=f_label, fill=(42,36,28))
        detail = f"{pos} · {size}"
        if notes:
            detail += f" · {notes}"
        draw.text((px+15, ry+20), detail, font=f_small, fill=(100,92,80))
        draw.text((px+15, ry+36), z_info.get("description",""), font=_font("InstrumentSans-Regular.ttf",13), fill=(130,120,105))
        ry += 58
        if ry > H - 80:
            break


# ── Run ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    mcp.run()
