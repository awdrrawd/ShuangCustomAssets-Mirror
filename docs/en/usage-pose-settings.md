# Per-Pose Settings

## What It Does

Characters in the game have different poses (arms, legs, full body). Different poses may need different texture positions and parameters.

Per-pose settings let you set different texture parameters for each pose combination. Poses without a per-pose config fall back to the global config (the default parameters in the edit panel).

## Pose Categories

| Category | Poses (UI labels) | Count |
|----------|-------------------|-------|
| Arm Pose | Arms Down, Yoked, Over The Head, Box Tie, Elbow Touch, Back Cuffs | 6 |
| Leg Pose | Standing, Kneel, Kneeling Spread, Legs Closed, Spread | 5 |
| Full Body Pose | Hogtied, All Fours | 2; overrides arm + leg |

An arm pose and a leg pose can combine (e.g. "Yoked + Kneel"). A full-body pose overrides both arm and leg poses.

> Pose names follow the English labels shown in the "Current pose" bar at the bottom of the edit panel.

## UI

The bottom of the edit panel shows the current pose info and the per-pose toggle:

```
Current pose: Yoked + Kneel    [Per-Pose: Off]
```

- **Current pose**: shows the character's current pose combination in real time
- **Per-Pose toggle**: click to toggle per-pose config for the current pose

## Workflow

### Enabling Per-Pose

1. Switch the character to the target pose (e.g. "Yoked + Kneel")
2. The bottom of the panel shows "Current pose: Yoked + Kneel"
3. Click "Per-Pose: Off"; it becomes "Per-Pose: On" (green)
4. All parameters in the edit panel (URL, offset, scale, etc.) now edit this pose's per-pose config
5. On first enable, all parameters are inherited from the global config (same as global)
6. Modify the parameters you need; preview updates live

### Switching Poses

While per-pose is enabled, switching the character's pose:
- The edit panel **auto-follows** to the new pose
- If the new pose already has per-pose config: loads that pose's config
- If the new pose has no per-pose config: falls back to global config mode (the previous pose's config is kept and not lost)
- You can enable per-pose for the new pose separately

### Disabling Per-Pose

Click "Per-Pose: On" to disable it:
- That pose's per-pose config is deleted
- The edit panel switches back to the global config

### Saving

Click the top-right checkmark "Confirm" in the edit panel:
- Saves **both** the global config and all enabled per-pose configs at once
- All configs are written to the item property at this moment
- You still need to click "Confirm & Exit" on the list page to sync to the server

### Canceling

Directly exiting (without clicking Confirm):
- **All changes are reverted**, including global and per-pose configs
- Restores to the original state before editing

## Common Scenarios

### Scenario 1: Different images per pose

```
Global:      default.png, OffsetX=1, OffsetY=1
Yoked+Kneel: yoked_kneel.png, OffsetX=15, OffsetY=-30
Hogtied:     hogtied.png, Rotation=90
```

1. Set the default image and parameters in the global config
2. Switch to "Yoked + Kneel"
3. Enable per-pose, modify URL and offset
4. Switch to "Hogtied"
5. Enable per-pose, modify URL and rotation
6. Click "Confirm" to save all configs

### Scenario 2: Hide the texture in a specific pose

```
Global:   Visible=true
AllFours: Visible=false
```

1. Switch to "All Fours"
2. Enable per-pose
3. Set "Shown" to off (done on the list page)
4. Click "Confirm" to save

### Scenario 3: Adjust offset only

```
Global: OffsetX=1, OffsetY=1
Kneel:  OffsetY=-30 (other params unchanged, inherited from global)
```

1. Switch to "Kneel"
2. Enable per-pose (all params inherited from global)
3. Modify only the Y offset
4. Click "Confirm" to save

> Even if you change only one parameter, per-pose saves the values of all fields. During rendering, the per-pose config takes precedence.
