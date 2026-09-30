"""
DREX-V2 Single Authoritative 25-Method Registry (M01–M25)
==========================================================
Canonical method registry defining frozen metadata, source provenance,
target compatibility, safety requirements, and decoupled runtime states
for all 25 DREX-V2 methods.

Architecture Invariants:
1. Static metadata (source repo, files, symbols, standards) is decoupled from runtime state.
2. Method identities (M01-M25) and categories are strictly invariant.
3. Every method maintains source provenance to verified upstream reference repositories.
4. Runtime states are rich and granular (never simplified to binary pass/fail).
"""

from __future__ import annotations

import enum
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set


# ─── Canonical Runtime States ──────────────────────────────────────────────────

class MethodRuntimeState(str, enum.Enum):
    """
    Granular, decoupled runtime states for DREX forensic and sanitization operations.
    Strictly distinguishes source readiness, backend availability, qualification,
    safety gating, and verified execution.
    """
    # Positive Lifecycle States
    VISIBLE = "VISIBLE"
    SOURCE_PROVEN = "SOURCE_PROVEN"
    IMPLEMENTED = "IMPLEMENTED"
    BACKEND_AVAILABLE = "BACKEND_AVAILABLE"
    TARGET_QUALIFIED = "TARGET_QUALIFIED"
    EXECUTABLE = "EXECUTABLE"
    AUTHORIZED = "AUTHORIZED"
    EXECUTED = "EXECUTED"
    VERIFIED = "VERIFIED"
    EVIDENCE_VERIFIED = "EVIDENCE_VERIFIED"
    CERTIFICATE_ELIGIBLE = "CERTIFICATE_ELIGIBLE"
    SEALED = "SEALED"

    # Negative / Blocking States
    UNSUPPORTED = "UNSUPPORTED"
    BACKEND_UNAVAILABLE = "BACKEND_UNAVAILABLE"
    TARGET_NOT_QUALIFIED = "TARGET_NOT_QUALIFIED"
    REQUIRES_OFFLINE_ENVIRONMENT = "REQUIRES_OFFLINE_ENVIRONMENT"
    SAFETY_BLOCKED = "SAFETY_BLOCKED"
    AUTHORIZATION_REQUIRED = "AUTHORIZATION_REQUIRED"
    VERIFICATION_UNAVAILABLE = "VERIFICATION_UNAVAILABLE"
    FAILED = "FAILED"


# ─── Canonical Method Definition Schema ───────────────────────────────────────

@dataclass(frozen=True)
class CanonicalMethodDefinition:
    """Immutable specification and source provenance of a single DREX method."""
    method_id: str                      # "M01" .. "M25"
    method_number: int                  # 1 .. 25
    name: str                           # Frozen Canonical Name
    category: str                       # "Drive Erasure", "File/Folder Erasure", "Recovery"
    is_destructive: bool                # True for M01-M16, False for M17-M25
    standard: str                       # Authoritative Standard Reference
    description: str                    # Exhaustive technical description
    technical_approach: str             # Specific algorithm & mechanism
    source_repository: str              # Upstream reference repo
    source_files: List[str]             # Exact upstream source file paths
    source_symbols: List[str]           # Exact functions/classes/structs
    platform: str                       # Supported OS platform(s)
    target_types: List[str]             # Compatible target types
    backend: str                        # Execution backend label
    prerequisites: List[str]            # Required environment prerequisites
    safety_requirements: List[str]      # Safety invariants and guardrails
    verification_strategy: str          # Post-op verification approach
    limitations: List[str]              # Known technical boundaries


# ─── The Authoritative 25-Method Registry Map ─────────────────────────────────

CANONICAL_METHOD_DEFINITIONS: Dict[int, CanonicalMethodDefinition] = {
    1: CanonicalMethodDefinition(
        method_id="M01",
        method_number=1,
        name="NIST SP 800-88 Policy Engine",
        category="Drive Erasure",
        is_destructive=True,
        standard="NIST SP 800-88 Rev. 2",
        description="Standards-authoritative physical drive sanitization policy engine coordinating block overwrite and firmware sanitization based on media type and security categorization.",
        technical_approach="Evaluates storage media characteristics and security categorization against NIST SP 800-88 Rev. 2 Clear/Purge decision tables, dispatching verified block overwrites or controller commands.",
        source_repository="DriveWipe-main",
        source_files=["crates/drivewipe-core/src/wipe/software.rs", "crates/drivewipe-core/src/wipe/mod.rs"],
        source_symbols=["SoftwareWipe", "WipeProfile", "WipeEngine"],
        platform="Windows / Linux / POSIX",
        target_types=["PHYSICAL_DRIVE"],
        backend="NIST SP 800-88 Policy Dispatcher",
        prerequisites=["Administrative elevation (root / SeManageVolumePrivilege)", "Direct physical disk access"],
        safety_requirements=["Fail-closed tripwire on active OS boot drive", "Two-Man Rule dual authorization with exact phrase confirmation"],
        verification_strategy="Cryptographic SHA-256 block readback verification and entropy delta verification.",
        limitations=["Cannot issue low-level firmware sanitize across non-translating USB-to-SATA/NVMe bridges without SCSI passthrough support."],
    ),
    2: CanonicalMethodDefinition(
        method_id="M02",
        method_number=2,
        name="Smart Sanitization",
        category="Drive Erasure",
        is_destructive=True,
        standard="NIST SP 800-88 Rev. 2 / IEEE 2883-2022",
        description="Automated multi-tier storage evaluation interrogating bus topology, media wear, trim support, and security state to select optimal compliant sanitization.",
        technical_approach="Probes storage controller capabilities across ATA, NVMe, and SCSI buses to dynamically determine whether firmware purge or software overwrite is compliant and safe.",
        source_repository="DriveWipe-main",
        source_files=["crates/drivewipe-core/src/drive/mod.rs", "crates/drivewipe-core/src/drive/detect.rs"],
        source_symbols=["DeviceInspector", "DriveCapabilities", "detect_drives"],
        platform="Windows / Linux / POSIX",
        target_types=["PHYSICAL_DRIVE"],
        backend="Heuristic Multi-Tier Evaluator",
        prerequisites=["Storage controller device inspection access", "SCSI/ATA/NVMe inquiry permission"],
        safety_requirements=["Identity fingerprinting before evaluation", "System disk classification lock"],
        verification_strategy="Pre-execution capability snapshot verification and post-execution re-enumeration.",
        limitations=["Requires direct controller access; virtual disks (VHD/VMDK) report emulated controller features."],
    ),
    3: CanonicalMethodDefinition(
        method_id="M03",
        method_number=3,
        name="Device-Native Sanitize",
        category="Drive Erasure",
        is_destructive=True,
        standard="NVMe 1.4+ / SCSI SBC-4 / NIST SP 800-88 Rev. 2 Purge",
        description="Controller-level hardware sanitize executing Block Erase, Crypto Scramble, or Overwrite commands directly in device controller firmware.",
        technical_approach="Issues direct NVMe Sanitize (Opcode 0x84) or SCSI Sanitize CDB via Windows IOCTL_STORAGE_PROTOCOL_COMMAND, polling controller Sanitize Status Log until completion.",
        source_repository="DriveWipe-main / nvme-cli-master",
        source_files=["crates/drivewipe-core/src/wipe/firmware/nvme.rs", "src/nvme-cmds-sanitize.c"],
        source_symbols=["NvmeSanitize", "nvme_sanitize", "sanitize_status_log"],
        platform="Windows (IOCTL_STORAGE_PROTOCOL_COMMAND) / Linux (nvme ioctl)",
        target_types=["PHYSICAL_DRIVE"],
        backend="DriveWipe IOCTL Pass-Through",
        prerequisites=["Native NVMe or SCSI controller port", "Firmware Sanitize command support in controller capabilities"],
        safety_requirements=["Permanent destructive operation; requires Two-Man Rule dual authorization", "Offline execution required if system disk"],
        verification_strategy="Sanitize Status Log polling (SPROG/SSTAT) and post-sanitize sector sample readback.",
        limitations=["Blocked on standard USB storage bridges; requires direct PCIe NVMe or UASP passthrough."],
    ),
    4: CanonicalMethodDefinition(
        method_id="M04",
        method_number=4,
        name="ATA Secure Erase",
        category="Drive Erasure",
        is_destructive=True,
        standard="ATA/ATAPI-8 / ACS-4 / NIST SP 800-88 Purge",
        description="Low-level ATA firmware erasure issuing 0xF1 SECURITY SET PASSWORD, 0xF3 SECURITY ERASE PREPARE, and 0xF4 SECURITY ERASE UNIT.",
        technical_approach="Constructs ATA taskfile registers for Security Set Password, Security Erase Prepare (0xF3), and Security Erase Unit (0xF4), transmitting via IOCTL_ATA_PASS_THROUGH.",
        source_repository="DriveWipe-main",
        source_files=["crates/drivewipe-core/src/wipe/firmware/ata.rs"],
        source_symbols=["AtaSecurityWipe", "build_ata_command", "send_ata_taskfile"],
        platform="Windows (IOCTL_ATA_PASS_THROUGH) / Linux (SG_IO / HDIO)",
        target_types=["PHYSICAL_DRIVE"],
        backend="DriveWipe ATA Pass-Through",
        prerequisites=["Direct SATA/AHCI controller connection", "Drive must not be in ATA Security FROZEN state"],
        safety_requirements=["Drive power-cycle required if frozen", "Two-Man Rule dual authorization"],
        verification_strategy="ATA IDENTIFY DEVICE security state readback (Disabled) and sample LBA readback comparison.",
        limitations=["Not supported over standard USB adapters; requires AHCI controller; BIOS/UEFI frequently freezes security state at boot."],
    ),
    5: CanonicalMethodDefinition(
        method_id="M05",
        method_number=5,
        name="NVMe Secure Erase",
        category="Drive Erasure",
        is_destructive=True,
        standard="NVM Express Base Specification / NIST SP 800-88 Purge",
        description="Native NVMe Format NVM Admin Command (Opcode 0x80) with Secure Erase Settings (SES=1 User Data Erase, SES=2 Cryptographic Erase).",
        technical_approach="Dispatches NVMe Admin Format NVM (Opcode 0x80) with SES=1 (User Data Erase) or SES=2 (Cryptographic Erase) via IOCTL_STORAGE_PROTOCOL_COMMAND.",
        source_repository="DriveWipe-main / nvme-cli-master",
        source_files=["crates/drivewipe-core/src/wipe/firmware/nvme.rs", "src/nvme-cmds-ctrl.c"],
        source_symbols=["NvmeFormat", "nvme_format", "nvme_admin_format_nvm"],
        platform="Windows (IOCTL_STORAGE_PROTOCOL_COMMAND) / Linux (NVME_IOCTL_ADMIN_CMD)",
        target_types=["PHYSICAL_DRIVE"],
        backend="DriveWipe NVMe Admin Protocol",
        prerequisites=["Native PCIe NVMe interface", "Format NVM supported in Controller Identify data"],
        safety_requirements=["Two-Man Rule dual authorization", "Pre-execution TOCTOU identity verification"],
        verification_strategy="NVMe Admin command completion status code 0x00 and namespace sector readback verification.",
        limitations=["Requires direct PCIe interface; unavailable on USB-to-NVMe enclosures."],
    ),
    6: CanonicalMethodDefinition(
        method_id="M06",
        method_number=6,
        name="IEEE 2883 Purge",
        category="Drive Erasure",
        is_destructive=True,
        standard="IEEE 2883-2022 Standard for Sanitizing Storage",
        description="Standard-compliant Purge execution routing to firmware sanitize/crypto-erase or verified multi-pass overwrite depending on media technology.",
        technical_approach="Applies IEEE 2883-2022 purge rules, selecting cryptographic erase for SEDs, block erase for solid-state media, or overwrite for magnetic media.",
        source_repository="DriveWipe-main",
        source_files=["crates/drivewipe-core/src/wipe/mod.rs", "crates/drivewipe-core/src/wipe/profile.rs"],
        source_symbols=["PurgeEngine", "Ieee2883Profile", "execute_purge"],
        platform="Windows / Linux / POSIX",
        target_types=["PHYSICAL_DRIVE"],
        backend="IEEE 2883 Policy Engine",
        prerequisites=["Target media characterization (Magnetic, SSD, NVMe, Hybrid)"],
        safety_requirements=["Strict verification distinction between firmware completion and software readback"],
        verification_strategy="Firmware completion status log plus independent sample sector readback.",
        limitations=["Byte-level verification only available where media allows direct addressable readback post-purge."],
    ),
    7: CanonicalMethodDefinition(
        method_id="M07",
        method_number=7,
        name="Verified Overwrite",
        category="Drive Erasure",
        is_destructive=True,
        standard="DoD 5220.22-M / NIST SP 800-88 Clear",
        description="Deterministic multi-pass block overwrite (e.g. 0x00, 0xFF, CSPRNG pseudo-random) with synchronous byte-by-byte readback verification.",
        technical_approach="Performs streaming sequential block writes of configured pattern passes followed by an immediate verification pass comparing every read block.",
        source_repository="DriveWipe-main / eraser-master",
        source_files=["crates/drivewipe-core/src/wipe/software.rs", "Eraser.Manager/Task.cs"],
        source_symbols=["SoftwareWipe", "PassExecutor", "WipePattern"],
        platform="Windows / Linux / POSIX",
        target_types=["PHYSICAL_DRIVE"],
        backend="Direct Block Multi-Pass Overwrite",
        prerequisites=["Direct block-level exclusive write access to target device"],
        safety_requirements=["Two-Man Rule dual authorization", "Safety phrase validation"],
        verification_strategy="100% full sector readback comparison against written pattern.",
        limitations=["Overprovisioned spare blocks and wear-leveling remapped sectors on flash SSDs cannot be reached via standard LBA writes."],
    ),
    8: CanonicalMethodDefinition(
        method_id="M08",
        method_number=8,
        name="CSPRNG Random Overwrite",
        category="File/Folder Erasure",
        is_destructive=True,
        standard="BSI TR-02102 / NIST SP 800-90A",
        description="Cryptographically secure pseudo-random number generator stream overwrite utilizing operating system entropy pools followed by flush and truncation.",
        technical_approach="Streams CSPRNG buffers (generated from Windows CryptGenRandom / Python secrets) over target file extents, forces OS flush to physical media, and truncates file.",
        source_repository="eraser-master / AKHANDA-main",
        source_files=["Eraser.DefaultPlugins/Prngs/RNGCrypto.cs", "akhanda/src/erasure/file_eraser.py"],
        source_symbols=["RNGCrypto", "FileEraser", "overwrite_random"],
        platform="Windows / Linux / POSIX",
        target_types=["FILE", "FOLDER"],
        backend="CSPRNG Stream Overwrite",
        prerequisites=["Write permission on target files and parent directories"],
        safety_requirements=["Target must be within authorized case scope; path traversal blocked"],
        verification_strategy="Post-wipe readback, Shannon entropy calculation (H >= 7.99), and pre/post SHA-256 comparison.",
        limitations=["Copy-on-Write (CoW) filesystems (Btrfs, ZFS, APFS) and SSD wear-leveling may preserve stale blocks in unallocated space."],
    ),
    9: CanonicalMethodDefinition(
        method_id="M09",
        method_number=9,
        name="Cryptographic Erasure",
        category="File/Folder Erasure",
        is_destructive=True,
        standard="NIST SP 800-88 Rev. 2 (Cryptographic Erase)",
        description="Immediate data invalidation by cryptographically zeroizing and destroying the encryption key material or envelope container master key.",
        technical_approach="Destroys master encryption keys, performs multiple CSPRNG overwrites of key storage slots, and verifies ciphertext unreconstructibility.",
        source_repository="DriveWipe-main",
        source_files=["crates/drivewipe-core/src/wipe/crypto_erase.rs"],
        source_symbols=["CryptoErase", "TcgOpal", "purge_key"],
        platform="Windows / Linux / POSIX",
        target_types=["FILE", "PHYSICAL_DRIVE"],
        backend="Key Lifecycle Invalidation",
        prerequisites=["Target data must be encrypted under verifiable cryptographic container / SED"],
        safety_requirements=["Key destruction audit event recorded in tamper-evident ledger"],
        verification_strategy="Proof of key zeroization and mathematical ciphertext unreconstructibility.",
        limitations=["DriveWipe explicitly documents Windows TCG Opal pass-through as unsupported; file-level crypto-erase requires intact cryptographic envelope."],
    ),
    10: CanonicalMethodDefinition(
        method_id="M10",
        method_number=10,
        name="File Slack / Cluster-Tip",
        category="File/Folder Erasure",
        is_destructive=True,
        standard="Forensic Media Sanitization Best Practices",
        description="Identifies the unallocated cluster-tip slack bytes between logical end-of-file and physical cluster boundary, zeroizing residual data without altering payload.",
        technical_approach="Calculates exact cluster geometry and slack offset, reading/preserving payload bytes, zeroing remaining cluster bytes, and validating payload checksum invariance.",
        source_repository="libfsntfs-main / eraser-master",
        source_files=["libfsntfs/libfsntfs_data_run.c", "Eraser.DefaultPlugins/FileSystems/NtfsFileSystem.cs"],
        source_symbols=["libfsntfs_data_stream_get_extents", "NtfsFileSystem", "EraseClusterTips"],
        platform="Windows / POSIX",
        target_types=["FILE"],
        backend="SlackSanitizer Extent Engine",
        prerequisites=["Filesystem cluster geometry knowledge (e.g. 4096-byte clusters)", "Unpadded non-resident or resident stream access"],
        safety_requirements=["Logical file payload length and SHA-256 MUST be preserved exactly"],
        verification_strategy="Pre/post logical payload SHA-256 invariance check and slack-range zero readback.",
        limitations=["Requires raw cluster access or Win32 SetFileValidData / low-level sector write permissions; sparse/compressed files require extent remapping."],
    ),
    11: CanonicalMethodDefinition(
        method_id="M11",
        method_number=11,
        name="Filesystem Metadata Sanitization",
        category="File/Folder Erasure",
        is_destructive=True,
        standard="BleachBit File Decontamination Architecture",
        description="Multi-stage directory entry and inode attribute sanitization scrambling filename, zeroing access/creation timestamps, wiping alternate streams, and unlinking.",
        technical_approach="Scrambles filename to random string, zeros timestamps, truncates alternate data streams, and unlinks file to ensure metadata cannot be recovered from directory entries.",
        source_repository="bleachbit-master / libfsntfs-main",
        source_files=["bleachbit/FileUtilities.py", "bleachbit/Wipe.py", "libfsntfs/libfsntfs_mft_entry.c"],
        source_symbols=["wipe_path", "wipe_name", "libfsntfs_mft_entry_sanitize"],
        platform="Windows / Linux / POSIX",
        target_types=["FILE", "FOLDER"],
        backend="FileSanitizer Metadata Scrub Engine",
        prerequisites=["Directory write and modify attributes permission"],
        safety_requirements=["Path traversal checks; operates strictly on specified target subtree"],
        verification_strategy="Directory re-enumeration ensuring filename and timestamps are neutralized prior to unlink.",
        limitations=["Journaling filesystems (NTFS USN journal, ext4 journal) may record metadata changes unless journals are explicitly flushed/cleared."],
    ),
    12: CanonicalMethodDefinition(
        method_id="M12",
        method_number=12,
        name="NIST SP 800-88 File Policy Engine",
        category="File/Folder Erasure",
        is_destructive=True,
        standard="NIST SP 800-88 Rev. 2 Clear",
        description="Standards-driven policy engine evaluating file target attributes to dispatch compliant single-pass zero or CSPRNG overwrite with audit verification.",
        technical_approach="Directs file-level Clear operations under NIST SP 800-88 Rev. 2 policy rules, enforcing verified overwriting and forensic audit event generation.",
        source_repository="drex-v2 / DriveWipe-main",
        source_files=["file_sanitizer.py", "drex_server.py"],
        source_symbols=["FileSanitizer", "NistClearProfile", "wipe_file"],
        platform="Windows / Linux / POSIX",
        target_types=["FILE", "FOLDER"],
        backend="File Policy Dispatcher",
        prerequisites=["Valid target file or directory path"],
        safety_requirements=["Active operational case binding required for forensic chain-of-custody"],
        verification_strategy="Byte-level readback verification and tamper-evident certificate issuance.",
        limitations=["Operates on logical file handles; flash memory controller garbage collection timing is outside OS control."],
    ),
    13: CanonicalMethodDefinition(
        method_id="M13",
        method_number=13,
        name="Secure Free-Space Wiping",
        category="File/Folder Erasure",
        is_destructive=True,
        standard="BleachBit Wipe Architecture / NIST SP 800-88 Clear",
        description="Allocates temporary filler extents up to a controlled safety headroom, overwriting unallocated clusters with zeros/CSPRNG streams, flushing, and removing.",
        technical_approach="Creates large contiguous filler files in target unallocated space leaving strict 100MB safety buffer, streams zero/random blocks, flushes, and unlinks.",
        source_repository="bleachbit-master / eraser-master",
        source_files=["bleachbit/WindowsWipe.py", "bleachbit/Wipe.py", "Eraser.DefaultPlugins/FileSystems/NtfsFileSystem.cs"],
        source_symbols=["wipe_free_space", "NtfsFileSystem", "EraseFreeSpace"],
        platform="Windows / Linux / POSIX",
        target_types=["VOLUME", "FOLDER"],
        backend="FreeSpaceSanitizer Headroom Engine",
        prerequisites=["Target volume mount point with free headroom (> 100 MB minimum buffer)"],
        safety_requirements=["Headroom safety limiter prevents volume exhaustion and system instability"],
        verification_strategy="Pre/post volume free capacity verification and filler extent reclamation proof.",
        limitations=["High disk I/O duration proportional to unallocated volume capacity; CoW snapshots may lock blocks."],
    ),
    14: CanonicalMethodDefinition(
        method_id="M14",
        method_number=14,
        name="Single-Pass Zero Overwrite",
        category="File/Folder Erasure",
        is_destructive=True,
        standard="NIST SP 800-88 Rev. 2 Clear",
        description="Single-pass overwrite writing 0x00 bytes across entire file extent, flushing OS file buffers to physical media, and truncating to zero bytes.",
        technical_approach="Overwrites logical file bytes with 0x00 chunks using native file descriptor, flushes filesystem buffers, and truncates file.",
        source_repository="AKHANDA-main / eraser-master",
        source_files=["akhanda/src/erasure/file_eraser.py", "Eraser.DefaultPlugins/ErasureMethods/SinglePass.cs"],
        source_symbols=["FileEraser", "overwrite_zero", "SinglePass"],
        platform="Windows / Linux / POSIX",
        target_types=["FILE", "FOLDER"],
        backend="Single-Pass Zero Engine",
        prerequisites=["File write and flush permission"],
        safety_requirements=["Path bounds verification against active case scope"],
        verification_strategy="100% readback comparison verifying all bytes are 0x00 before unlinking.",
        limitations=["Wear-leveling on SSDs and non-flushed cache controllers may delay physical NAND erasure."],
    ),
    15: CanonicalMethodDefinition(
        method_id="M15",
        method_number=15,
        name="Storage-Aware Sanitization Fallback",
        category="File/Folder Erasure",
        is_destructive=True,
        standard="DREX Adaptive Controller Policy",
        description="Dynamic fallback engine selecting the strongest supported sanitization method when hardware firmware commands are blocked or unsupported by target.",
        technical_approach="Evaluates storage capabilities and automatically falls back from blocked firmware commands to verified multi-pass block overwrite or file shredding.",
        source_repository="DriveWipe-main",
        source_files=["crates/drivewipe-core/src/drive/mod.rs"],
        source_symbols=["DriveCapabilities", "FallbackMatrix"],
        platform="Windows / Linux / POSIX",
        target_types=["PHYSICAL_DRIVE", "FILE", "FOLDER"],
        backend="Storage Controller Fallback Matrix",
        prerequisites=["Target device capabilities snapshot"],
        safety_requirements=["Fallback reasons must be fully explainable and logged in audit trail"],
        verification_strategy="Audit log validation of fallback criteria and selected alternative method.",
        limitations=["Fallback to software overwrite on flash SSDs cannot guarantee overprovisioned sector wipe."],
    ),
    16: CanonicalMethodDefinition(
        method_id="M16",
        method_number=16,
        name="Temporary / Cache Sanitization",
        category="File/Folder Erasure",
        is_destructive=True,
        standard="BleachBit Cleaner Architecture",
        description="Target-scoped sanitization of temporary files, swap artifacts, thumbnail caches, and staging directories strictly constrained to authorized paths.",
        technical_approach="Scans target directory tree, identifies temporary and cached files, applies verified overwrite, and deletes entries within authorized root.",
        source_repository="bleachbit-master",
        source_files=["bleachbit/Cleaner.py", "bleachbit/Wipe.py"],
        source_symbols=["Cleaner", "clean", "wipe_path"],
        platform="Windows / Linux / POSIX",
        target_types=["FOLDER"],
        backend="Temp Cache Scrubber",
        prerequisites=["Write access to authorized temporary directory path"],
        safety_requirements=["Strict path jail: Never cleans global OS paths without explicit user target binding"],
        verification_strategy="Residual file count check (Count = 0) and directory inode re-inspection.",
        limitations=["Locked files currently held open by other system processes cannot be sanitized until closed."],
    ),
    17: CanonicalMethodDefinition(
        method_id="M17",
        method_number=17,
        name="Quick Recovery",
        category="Recovery",
        is_destructive=False,
        standard="The Sleuth Kit (TSK) Forensic Filesystem Extraction",
        description="Rapid non-destructive filesystem traversal using TSK fls and icat to extract deleted files from intact directory metadata and inode allocations.",
        technical_approach="Executes TSK fls with recursive deleted flags (-d -r -p) to locate unlinked inodes, followed by targeted icat extraction to case vault.",
        source_repository="sleuthkit-develop-4.1x (1)",
        source_files=["tools/fstools/fls.cpp", "tools/fstools/icat.cpp"],
        source_symbols=["fls", "icat"],
        platform="Windows (native_bin/fls.exe, icat.exe) / Linux",
        target_types=["DISK_IMAGE", "PARTITION"],
        backend="TSK fls + icat",
        prerequisites=["Valid disk image or raw partition with recognized filesystem (NTFS/FAT/ext4)"],
        safety_requirements=["Read-only access; source media hash integrity check"],
        verification_strategy="SHA-256 calculation on extracted candidates and vault registration.",
        limitations=["Requires intact filesystem metadata; overwritten directory entries cannot be discovered."],
    ),
    18: CanonicalMethodDefinition(
        method_id="M18",
        method_number=18,
        name="Smart Recovery",
        category="Recovery",
        is_destructive=False,
        standard="TSK Filesystem Analysis & Heuristic Prioritization",
        description="Comprehensive filesystem structural inspection with fsstat and fls, combining metadata recovery with automatic fallback to file carving.",
        technical_approach="Parses filesystem metadata via TSK fsstat, identifies volume geometry, enumerates deleted entries with fls, and falls back to carving if damaged.",
        source_repository="sleuthkit-develop-4.1x (1)",
        source_files=["tools/fstools/fsstat.cpp", "tools/fstools/fls.cpp", "tools/fstools/tsk_recover.cpp"],
        source_symbols=["fsstat", "fls", "tsk_recover"],
        platform="Windows (native_bin/fsstat.exe, fls.exe) / Linux",
        target_types=["DISK_IMAGE", "PARTITION"],
        backend="TSK fsstat + fls + Carving",
        prerequisites=["Valid filesystem image or partition target"],
        safety_requirements=["Strict read-only forensic isolation"],
        verification_strategy="Filesystem geometry validation and candidate hash verification.",
        limitations=["Severely corrupted superblock or MFT mirrors may limit metadata extraction."],
    ),
    19: CanonicalMethodDefinition(
        method_id="M19",
        method_number=19,
        name="Targeted Recovery",
        category="Recovery",
        is_destructive=False,
        standard="TSK Direct Inode Address Recovery",
        description="Direct block extraction of specific file inodes or data runs using TSK icat without requiring directory tree reconstruction.",
        technical_approach="Invokes TSK icat targeting specific inode/MFT record numbers to reconstruct data stream directly from block allocation maps.",
        source_repository="sleuthkit-develop-4.1x (1)",
        source_files=["tools/fstools/icat.cpp"],
        source_symbols=["icat"],
        platform="Windows (native_bin/icat.exe) / Linux",
        target_types=["DISK_IMAGE", "PARTITION"],
        backend="TSK icat Inode Extraction",
        prerequisites=["Known valid inode or MFT record number"],
        safety_requirements=["Extracted payload isolated into Case Vault under active case ID"],
        verification_strategy="Extracted artifact SHA-256 calculation and structural header validation.",
        limitations=["If file extents were overwritten post-deletion, recovered stream will contain overwritten payload."],
    ),
    20: CanonicalMethodDefinition(
        method_id="M20",
        method_number=20,
        name="Filesystem Recovery",
        category="Recovery",
        is_destructive=False,
        standard="TSK Batch Recursive Recovery",
        description="Automated bulk recovery extracting all recoverable deleted and allocated files from filesystem partitions into structured forensic vault folders.",
        technical_approach="Executes TSK tsk_recover to reconstruct complete recoverable directory trees from disk image or raw partition into isolated vault staging.",
        source_repository="sleuthkit-develop-4.1x (1)",
        source_files=["tools/fstools/tsk_recover.cpp"],
        source_symbols=["tsk_recover"],
        platform="Windows (native_bin/tsk_recover.exe) / Linux",
        target_types=["DISK_IMAGE", "PARTITION"],
        backend="TSK tsk_recover",
        prerequisites=["Sufficient destination storage space in case vault"],
        safety_requirements=["Destination directory must be strictly isolated to active case vault"],
        verification_strategy="Batch recovery manifest generation and individual artifact SHA-256 hashing.",
        limitations=["Disk image must possess partially intact filesystem structures."],
    ),
    21: CanonicalMethodDefinition(
        method_id="M21",
        method_number=21,
        name="Deep Recovery",
        category="Recovery",
        is_destructive=False,
        standard="PhotoRec File Carving Architecture",
        description="Deep sector-by-sector raw file carving scanning magic-byte headers and footers across unallocated space, validating file structures independently.",
        technical_approach="Scans contiguous sector streams for file signature headers/footers using PhotoRec 7.2 engine and DREX structural validators (JPEG, PNG, ZIP, PDF).",
        source_repository="testdisk-master / AKHANDA-main",
        source_files=["src/photorec.c", "src/file_*.c", "akhanda/src/recovery/zipcarve.py"],
        source_symbols=["photorec_carver", "file_check", "ZipCarveStream"],
        platform="Windows (native_bin/photorec_win.exe) / Linux",
        target_types=["DISK_IMAGE", "RAW_SECTOR_STREAM", "PHYSICAL_DRIVE"],
        backend="PhotoRec 7.2 + DREX Native Carver",
        prerequisites=["Raw sector stream read access"],
        safety_requirements=["Non-destructive read-only operation; strict output destination jailing"],
        verification_strategy="Format-specific structural parser validation (JPEG/PNG/ZIP/PDF) and SHA-256.",
        limitations=["Non-contiguous fragmented files may be truncated or corrupted without fragment reassembly."],
    ),
    22: CanonicalMethodDefinition(
        method_id="M22",
        method_number=22,
        name="Fragment Recovery",
        category="Recovery",
        is_destructive=False,
        standard="AKHANDA / Resurgence Fragment Assembly Architecture",
        description="Advanced heuristic and entropy-based reconstruction reassembling non-contiguous, out-of-order file fragments using boundary seam scoring.",
        technical_approach="Analyzes fragment chunk candidate boundaries, computing Shannon seam entropy, format-specific header continuations, and parsing reconstructed payloads.",
        source_repository="AKHANDA-main / testdisk-master",
        source_files=["akhanda/src/recovery/reassemble.py", "akhanda/src/recovery/zipcarve.py", "src/photorec.c"],
        source_symbols=["FragmentReassembler", "calculate_seam_entropy", "reassemble_stream"],
        platform="Windows / POSIX",
        target_types=["DISK_IMAGE", "SPLIT_STREAM"],
        backend="DREX Native Fragment Engine",
        prerequisites=["Fragment candidate chunks identified with boundary offsets"],
        safety_requirements=["Pure computational reassembly in memory/temp staging without source mutation"],
        verification_strategy="Full format decoder validation (e.g. zipfile.is_zipfile / PIL / PyPDF) and CRC32 checks.",
        limitations=["Combinatorial complexity increases exponentially with fragment count; requires recognizable headers/footers."],
    ),
    23: CanonicalMethodDefinition(
        method_id="M23",
        method_number=23,
        name="RAID / Storage Recovery",
        category="Recovery",
        is_destructive=False,
        standard="TSK Volume Management (mmls) / TestDisk Partition Analysis",
        description="Multi-disk volume and partition table recovery analyzing RAID chunk striping, partition boundaries, and filesystem geometry.",
        technical_approach="Executes TSK mmls volume analysis and TestDisk non-destructive partition probing to reconstruct volume geometry across RAID members.",
        source_repository="sleuthkit-develop-4.1x (1) / testdisk-master",
        source_files=["tools/vstools/mmls.cpp", "src/testdisk.c"],
        source_symbols=["mmls", "testdisk_analyze", "dump_partition_table"],
        platform="Windows (native_bin/mmls.exe, testdisk_win.exe) / Linux",
        target_types=["MULTI_DISK_IMAGE", "RAID_ARRAY"],
        backend="DREX Native RAID Engine",
        prerequisites=["All constituent disk images or physical members of RAID set"],
        safety_requirements=["Read-only analysis; partition table modifications are never written automatically"],
        verification_strategy="Volume descriptor parity verification and partition layout consistency.",
        limitations=["Hardware-level RAID requires specific controller configuration; custom proprietary stripes require manual geometry specification."],
    ),
    24: CanonicalMethodDefinition(
        method_id="M24",
        method_number=24,
        name="Damaged Media Recovery",
        category="Recovery",
        is_destructive=False,
        standard="GNU ddrescue Non-Destructive Phased Imaging",
        description="Resilient block rescue imaging bad sectors via phased copy, split, and scrape passes with persistent mapfile tracking.",
        technical_approach="Runs GNU ddrescue non-destructive phased imaging (-n, -r3) with persistent mapfile, tracking rescued versus bad sector blocks truthfully.",
        source_repository="GNU ddrescue",
        source_files=["ddrescue.cc", "mapfile.cc"],
        source_symbols=["ddrescue", "mapfile", "read_rescue"],
        platform="Linux (Native) / Windows (Cygwin/WSL)",
        target_types=["PHYSICAL_DRIVE", "DAMAGED_MEDIA"],
        backend="DREX Damaged Media Imager + ddrescue",
        prerequisites=["GNU ddrescue binary on host system; direct access to source storage device"],
        safety_requirements=["Strictly non-destructive; reads from failing drive to separate destination image"],
        verification_strategy="Ddrescue mapfile log inspection verifying rescued block percentages and error domains.",
        limitations=["GNU ddrescue is a Linux native utility; on Windows hosts without ddrescue binary, reports BACKEND UNAVAILABLE truthfully."],
    ),
    25: CanonicalMethodDefinition(
        method_id="M25",
        method_number=25,
        name="Forensic Recovery",
        category="Recovery",
        is_destructive=False,
        standard="ISO/IEC 27037 / NIST SP 800-88 Rev. 2 Forensic Evidence Architecture",
        description="Complete forensic chain-of-custody integration binding recovered artifacts to SHA-256 hash-chained audit ledgers and tamper-evident certificates.",
        technical_approach="Registers extracted evidence into Forensic Vault, binds artifacts to immutable SHA-256 hash-chained timeline ledger, and generates digitally verifiable certificates.",
        source_repository="sleuthkit-develop-4.1x (1) / AKHANDA-main",
        source_files=["tools/fstools/fls.cpp", "akhanda/src/certificate/generator.py"],
        source_symbols=["fls", "ForensicVault", "CertificateGenerator"],
        platform="Windows / Linux / POSIX",
        target_types=["FORENSIC_IMAGE", "EVIDENCE_VAULT"],
        backend="Forensic Vault + Audit Ledger",
        prerequisites=["Active operational forensic case and initialized case vault"],
        safety_requirements=["Cryptographic hash chaining: Every event links prior hash to guarantee tamper evidence"],
        verification_strategy="Re-computation of entire SHA-256 event hash chain and independent certificate digest validation.",
        limitations=["Requires valid case directory; cannot certify unverified, simulated, or failed operations."],
    ),
}


# ─── Authoritative Registry Class ─────────────────────────────────────────────

class CanonicalMethodRegistry:
    """Authoritative canonical registry and query provider for M01-M25."""

    @classmethod
    def get_all(cls) -> Dict[int, CanonicalMethodDefinition]:
        """Return full mapping of canonical method definitions."""
        return CANONICAL_METHOD_DEFINITIONS

    @classmethod
    def get(cls, method_id: int | str) -> Optional[CanonicalMethodDefinition]:
        """Retrieve method definition by integer ID (1..25) or string ('M01'..'M25')."""
        if isinstance(method_id, int):
            return CANONICAL_METHOD_DEFINITIONS.get(method_id)
        if isinstance(method_id, str):
            clean = method_id.strip().upper()
            if clean.startswith("M") and clean[1:].isdigit():
                return CANONICAL_METHOD_DEFINITIONS.get(int(clean[1:]))
            if clean.isdigit():
                return CANONICAL_METHOD_DEFINITIONS.get(int(clean))
        return None

    @classmethod
    def get_canonical_spec_dict(cls) -> Dict[int, Dict[str, Any]]:
        """
        Produce backwards-compatible specification dictionary identical to
        CANONICAL_25_METHODS_SPEC, enriched with all authoritative metadata.
        """
        spec: Dict[int, Dict[str, Any]] = {}
        for mid, m in CANONICAL_METHOD_DEFINITIONS.items():
            spec[mid] = {
                "method_id": m.method_id,
                "method_number": m.method_number,
                "name": m.name,
                "category": m.category,
                "is_destructive": m.is_destructive,
                "standard": m.standard,
                "description": m.description,
                "technical_approach": m.technical_approach,
                "source_repository": m.source_repository,
                "source_files": list(m.source_files),
                "source_symbols": list(m.source_symbols),
                "platform": m.platform,
                "target_types": list(m.target_types),
                "backend": m.backend,
                "prerequisites": list(m.prerequisites),
                "safety_requirements": list(m.safety_requirements),
                "verification_strategy": m.verification_strategy,
                "limitations": list(m.limitations),
            }
        return spec

    @classmethod
    def determine_runtime_state(
        cls,
        method_id: int,
        target_type: Optional[str] = None,
        media_type: Optional[str] = None,
        is_system_disk: bool = False,
        is_offline_ready: bool = False,
        is_elevated: bool = False,
        backend_available: bool = True,
        is_authorized: bool = False,
        is_executed: bool = False,
        is_verified: bool = False,
        is_sealed: bool = False,
    ) -> MethodRuntimeState:
        """
        Decoupled state evaluator computing exact truthful runtime state.
        Never collapses to a naive boolean PASS/FAIL.
        """
        defn = cls.get(method_id)
        if not defn:
            return MethodRuntimeState.UNSUPPORTED

        # Negative State Precedences
        if not backend_available:
            return MethodRuntimeState.BACKEND_UNAVAILABLE

        # Target Type Incompatibilities
        if target_type in ("FILE", "FOLDER") and defn.category == "Drive Erasure":
            return MethodRuntimeState.TARGET_NOT_QUALIFIED
        if target_type == "PHYSICAL_DRIVE" and defn.category == "File/Folder Erasure":
            return MethodRuntimeState.TARGET_NOT_QUALIFIED

        # Specific Hardware Topology Requirements
        if method_id == 4 and media_type == "NVME_SSD":
            return MethodRuntimeState.UNSUPPORTED
        if method_id in (3, 4, 5) and media_type == "USB":
            return MethodRuntimeState.UNSUPPORTED

        # Elevation Requirements
        if target_type == "PHYSICAL_DRIVE" and not is_elevated and defn.is_destructive:
            return MethodRuntimeState.SAFETY_BLOCKED

        # Active System Disk Safety Tripwire
        if is_system_disk and defn.is_destructive:
            if not is_offline_ready:
                return MethodRuntimeState.REQUIRES_OFFLINE_ENVIRONMENT

        # Positive Lifecycle Progression
        if is_sealed:
            return MethodRuntimeState.SEALED
        if is_verified:
            return MethodRuntimeState.EVIDENCE_VERIFIED
        if is_executed:
            return MethodRuntimeState.EXECUTED
        if is_authorized:
            return MethodRuntimeState.AUTHORIZED
        if is_elevated or target_type != "PHYSICAL_DRIVE":
            return MethodRuntimeState.EXECUTABLE

        return MethodRuntimeState.TARGET_QUALIFIED
