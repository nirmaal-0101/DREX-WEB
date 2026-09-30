"""
drex_app -- Cloud-Safe Stub for DREX Web Deployment
====================================================
This module provides the minimal interface required by drex_server.py for cloud
deployment. The full desktop GUI application (drex_app.py in the dev repo) uses
tkinter and Windows-only WMI/CIM APIs unavailable on Linux/Render.

On Linux (cloud), discover_drives() returns an empty list and the /api/devices
endpoint correctly reports: Physical drive access UNAVAILABLE IN CLOUD.

On Windows (local workstation), basic drive enumeration runs via PowerShell.
"""

from __future__ import annotations

import os
import sys
from dataclasses import dataclass, field
from typing import List


@dataclass
class DriveInfo:
    """Minimal DriveInfo compatible with drex_server.py consumer code."""
    path: str = ""
    device_id: str = ""
    device_path: str = ""
    label: str = ""
    filesystem: str = "UNKNOWN"
    size_bytes: int = 0
    free_bytes: int = 0
    drive_type: int = 3
    model: str = "CLOUD_ENVIRONMENT"
    serial: str = "N/A"
    interface_type: str = "UNAVAILABLE"
    media_type: str = "UNAVAILABLE"
    is_system: bool = False
    is_boot: bool = False
    mount_points: List[str] = field(default_factory=list)


def discover_drives() -> List[DriveInfo]:
    """
    Enumerate storage drives.
    On Linux/cloud: returns empty list (UNAVAILABLE IN CLOUD).
    On Windows: enumerates logical disks via PowerShell.
    """
    if sys.platform != "win32":
        return []

    import subprocess, json
    results: List[DriveInfo] = []
    try:
        cmd = ("Get-CimInstance Win32_LogicalDisk | "
               "Select-Object DeviceID,VolumeName,FileSystem,Size,FreeSpace,DriveType | "
               "ConvertTo-Json -Compress")
        proc = subprocess.run(["powershell", "-NonInteractive", "-Command", cmd],
                              capture_output=True, text=True, timeout=10)
        if proc.returncode == 0 and proc.stdout.strip():
            raw = json.loads(proc.stdout.strip())
            if isinstance(raw, dict):
                raw = [raw]
            for d in raw:
                did = d.get("DeviceID", "")
                results.append(DriveInfo(
                    path=did, device_id=did, device_path=did,
                    label=d.get("VolumeName", ""),
                    filesystem=d.get("FileSystem", "UNKNOWN") or "UNKNOWN",
                    size_bytes=int(d.get("Size") or 0),
                    free_bytes=int(d.get("FreeSpace") or 0),
                    drive_type=int(d.get("DriveType") or 3),
                    model="LOCAL_DISK", serial="", interface_type="LOCAL",
                    media_type="FIXED",
                    is_system=(did.upper().startswith("C:")),
                    is_boot=(did.upper().startswith("C:")),
                    mount_points=[did],
                ))
    except Exception:
        pass
    return results
