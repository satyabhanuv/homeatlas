# Design Agent MCP Server

An AI-powered design agent that helps you plan and visualize interior and backyard spaces. Built as a local MCP server that integrates directly with Claude Desktop.

## What It Does

- **Plan any space** — backyard, living room, kitchen, bedroom, office
- **Apply design styles** — Modern Farmhouse, California Modern, Tropical Resort, Mediterranean, Scandinavian Minimal
- **Arrange zones** — BBQ kitchen, seating areas, lawn, fire pit, pool, play areas, garden beds, and 15+ more
- **Render visual plans** — generates a high-quality PNG floor plan with material palette

---

## Setup

### 1. Install Python dependencies

```bash
cd ~/Documents  # or wherever you placed the design-agent folder
pip install -r /path/to/design-agent/requirements.txt
```

Or install directly:
```bash
pip install "mcp[cli]" Pillow pydantic httpx
```

### 2. (Optional) Add fonts for better rendering

Place `.ttf` font files in a `fonts/` subdirectory next to the server file, or set the `FONT_DIR` environment variable to point to a directory containing fonts.

Recommended free fonts:
- **Inter** — https://fonts.google.com/specimen/Inter
- **Playfair Display** — https://fonts.google.com/specimen/Playfair+Display

The server works without custom fonts (falls back to default PIL font).

### 3. Connect to Claude Desktop

Open your Claude Desktop config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add the design agent to your `mcpServers` section:

```json
{
  "mcpServers": {
    "design-agent": {
      "command": "python",
      "args": ["/FULL/PATH/TO/design-agent/design_agent_server.py"],
      "env": {
        "FONT_DIR": "/FULL/PATH/TO/design-agent/fonts"
      }
    }
  }
}
```

**Replace** `/FULL/PATH/TO/design-agent/` with the actual path to where you saved this folder.

### 4. Restart Claude Desktop

After saving the config, fully quit and relaunch Claude Desktop. The design agent tools will appear automatically.

---

## Usage

Once connected, you can talk to Claude naturally:

> "Start a new backyard design for my house. It's about 40 feet wide and 35 feet deep."

> "Add a BBQ kitchen zone in the back-center and a dining area in the center."

> "Apply the California Modern style."

> "Render the design so I can see it."

Claude will call the appropriate tools and generate a visual floor plan saved to `~/Documents/DesignAgent/renders/`.

---

## Available Tools

| Tool | Description |
|------|-------------|
| `design_start_project` | Start a new design project for a space |
| `design_update_zone` | Add or update a zone in the layout |
| `design_set_style` | Apply a design style to the project |
| `design_render` | Render the current design as a PNG |
| `design_get_project` | Get the current project state |
| `design_list_styles` | List available design styles |
| `design_list_zones` | List available zone types |
| `design_reset` | Reset and start fresh |

---

## Design Styles

| Style | Description |
|-------|-------------|
| `modern_farmhouse` | Warm whites, black accents, natural wood |
| `california_modern` | Warm concrete, cedar, native plants |
| `tropical_resort` | Lush greens, natural stone, bamboo |
| `mediterranean` | Terra cotta, cobalt, textured plaster |
| `scandinavian_minimal` | Light birch, pale stone, clean lines |

---

## Zone Types

**Backyard:** `bbq_kitchen`, `dining_area`, `seating_area`, `lawn_zone`, `fire_pit`, `pool`, `hot_tub`, `play_area`, `garden_beds`, `pergola`, `pathway`, `water_feature`

**Interior:** `living_area`, `kitchen_zone`, `dining_room`, `bedroom`, `office_nook`, `entryway`, `bathroom`, `laundry`

---

## Output Files

All designs are saved to `~/Documents/DesignAgent/`:
- `current_project.json` — current project state (auto-saved)
- `renders/` — rendered PNG floor plans

---

## Troubleshooting

**Server not showing up in Claude Desktop:**
- Make sure the path in `claude_desktop_config.json` is the full absolute path
- Verify Python is installed: `python --version`
- Check that dependencies are installed: `pip list | grep mcp`

**Render fails with font error:**
- The server will fall back to default fonts automatically — no action needed

**Permission error on macOS:**
- Make the server file executable: `chmod +x design_agent_server.py`
