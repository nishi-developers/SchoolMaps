#!/usr/bin/env python3
"""
Web プロジェクトのMITライセンス互換性チェックスクリプト
Checks MIT license compatibility for the web project dependencies
"""

import json
import sys

# MIT compatible licenses based on common understanding
# https://en.wikipedia.org/wiki/License_compatibility
MIT_COMPATIBLE = [
    "MIT",
    "ISC",
    "Apache-2.0",
    "BSD-2-Clause",
    "BSD-3-Clause",
    "BlueOak-1.0.0",
    "CC0-1.0",
    "0BSD",
    "Unlicense",
    "WTFPL",
    "CC-BY-3.0",
    "CC-BY-4.0",
    "Python-2.0",
    "AFL-2.1",
]

# Potentially problematic licenses
PROBLEMATIC = ["GPL", "LGPL", "AGPL", "CDDL", "EPL", "MPL"]

# Read license data from stdin or file
if len(sys.argv) > 2:
    # Package name prefix to skip (the main package itself)
    PACKAGE_PREFIX = sys.argv[1]

    with open(sys.argv[2], "r", encoding="utf-8") as f:
        licenses_data = json.load(f)
else:
    print("Usage: check_license_compatibility.py <package-prefix> <license-data-file>")
    sys.exit(1)

compatible = []
incompatible = []
dual_license = []
unknown = []

for package, info in licenses_data.items():
    license_str = info.get("licenses", "UNKNOWN")

    # Skip the main package itself
    if package.startswith(PACKAGE_PREFIX):
        continue

    # Handle dual/multi licenses (OR operator)
    if " OR " in license_str or " or " in license_str:
        dual_license.append({"package": package, "license": license_str})
    # Handle multi licenses (AND operator) - potentially problematic
    elif " AND " in license_str or " and " in license_str:
        incompatible.append(
            {
                "package": package,
                "license": license_str,
                "reason": "Multiple licenses with AND operator",
            }
        )
    # Check if any problematic license
    elif any(prob in license_str for prob in PROBLEMATIC):
        if " OR " not in license_str:  # If not dual license
            incompatible.append(
                {
                    "package": package,
                    "license": license_str,
                    "reason": "Copyleft license without alternative",
                }
            )
    # Check if compatible
    elif (
        license_str in MIT_COMPATIBLE
        or license_str.startswith("(")
        and all(
            lic.strip() in MIT_COMPATIBLE
            for lic in license_str.strip("()").split(" OR ")
        )
    ):
        compatible.append({"package": package, "license": license_str})
    else:
        unknown.append({"package": package, "license": license_str})

print("=== LICENSE COMPATIBILITY CHECK ===\n")
print(f"Total packages checked: {len(licenses_data) - 1}")  # -1 for main package
print(f"MIT-compatible: {len(compatible)}")
print(f"Dual-licensed (need review): {len(dual_license)}")
print(f"Potentially incompatible: {len(incompatible)}")
print(f"Unknown/Need review: {len(unknown)}")

if incompatible:
    print("\n=== POTENTIALLY INCOMPATIBLE LICENSES ===")
    for item in incompatible:
        print(f"  - {item['package']}: {item['license']} ({item['reason']})")

if dual_license:
    print("\n=== DUAL-LICENSED PACKAGES (Review Needed) ===")
    for item in dual_license[:10]:  # Show first 10
        print(f"  - {item['package']}: {item['license']}")
    if len(dual_license) > 10:
        print(f"  ... and {len(dual_license) - 10} more")

if unknown:
    print("\n=== UNKNOWN/NEED REVIEW ===")
    for item in unknown[:10]:
        print(f"  - {item['package']}: {item['license']}")
    if len(unknown) > 10:
        print(f"  ... and {len(unknown) - 10} more")

# Determine overall compatibility
if not incompatible and not unknown:
    print("\n✓ All dependencies appear to be MIT-compatible!")
    sys.exit(0)
elif incompatible:
    print("\n⚠ Some dependencies may have compatibility issues!")
    sys.exit(1)
else:
    print("\n⚠ Some licenses need manual review!")
    sys.exit(2)
