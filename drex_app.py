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
from typing import List, Optional


@dataclass
class DriveInfo:
    """Minimal DriveInfo compatible with drex_server.py consumer code."""
    path: str = ""
    device_id: str = ""
    device_path: str = ""
    label: str = ""
    filesystem: str = "UNKNOWN"
    capacity: int = 0
    size_bytes: int = 0
    free: int = 0
    free_bytes: int = 0
    drive_type: str = "3"
    model: str = "LOCAL_DISK"
    serial: str = "N/A"
    interface: str = "LOCAL"
    interface_type: str = "LOCAL"
    transport_bus: str = "LOCAL"
    underlying_interface: str = "LOCAL"
    media_type: str = "FIXED"
    sector_size: int = 512
    is_usb_bridge: bool = False
    is_system: bool = False
    is_boot: bool = False
    is_system_or_boot: bool = False
    health: str = "OK"
    status: str = "OK"
    mount_points: List[str] = field(default_factory=list)

    def display(self, field_name: str) -> str:
        value = getattr(self, field_name, None)
        return str(value) if value not in (None, "") else "Unavailable"


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
        cmd = (
            "Get-CimInstance Win32_LogicalDisk | "
            "Select-Object DeviceID,VolumeName,FileSystem,Size,FreeSpace,DriveType | "
            "ConvertTo-Json -Compress"
        )
        proc = subprocess.run(
            ["powershell", "-NonInteractive", "-Command", cmd],
            capture_output=True, text=True, timeout=10
        )
        if proc.returncode == 0 and proc.stdout.strip():
            raw = json.loads(proc.stdout.strip())
            if isinstance(raw, dict):
                raw = [raw]
            for d in raw:
                did = str(d.get("DeviceID", "") or "")
                sz = int(d.get("Size") or 0)
                fr = int(d.get("FreeSpace") or 0)
                dt = str(d.get("DriveType") or "3")
                is_sys = did.upper().startswith("C:")
                results.append(DriveInfo(
                    path=did,
                    device_id=did,
                    device_path=did,
                    label=str(d.get("VolumeName", "") or ""),
                    filesystem=str(d.get("FileSystem", "UNKNOWN") or "UNKNOWN"),
                    capacity=sz,
                    size_bytes=sz,
                    free=fr,
                    free_bytes=fr,
                    drive_type=dt,
                    model=f"Local Disk ({did})" if did else "LOCAL_DISK",
                    serial="LOCAL-" + did.replace(":", ""),
                    interface="LOCAL",
                    interface_type="LOCAL",
                    transport_bus="LOCAL",
                    underlying_interface="LOCAL",
                    media_type="FIXED",
                    sector_size=512,
                    is_usb_bridge=False,
                    is_system=is_sys,
                    is_boot=is_sys,
                    is_system_or_boot=is_sys,
                    mount_points=[did] if did else [],
                ))
    except Exception as exc:
        print(f"discover_drives exception: {exc}")
    return results
