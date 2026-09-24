[app]

# (str) Title of your application
title = AGATE Sovereign Wallet & Harvester (w/ Solvex Pipeline)

# (str) Package name
package.name = agate_sovereign_suite

# (str) Package domain (needed for android/ios packaging)
package.domain = org.iamfather420_ctrl

# (str) Source code where the main.py live
source.dir = .

# (list) Source files to include (let empty to include all the files)
source.include_exts = py,png,jpg,kv,atlas,json,txt

# (list) Source files to exclude
source.exclude_dirs = tests, bin

# (str) Application versioning
version = 1.0.0

# (list) Application requirements
# SQLite3, OS, JSON, and network request tools required for 
# ~/.agate_node/vault/consensus_memory.json read/writes and ai_handshake.txt
# Added base requirements expected for AI Studio web/solvex integrations wrapped Kivy
requirements = python3,kivy,requests,sqlite3,webbrowser

# (str) Custom source folders for requirements
# Sets custom source for any requirements where necessary
# custom_source_dirs =

# (list) Permissions
android.permissions = INTERNET, WRITE_EXTERNAL_STORAGE, READ_EXTERNAL_STORAGE

# (int) Target Android API, should be as high as possible.
android.api = 34

# (int) Minimum API your APK will support.
android.minapi = 24

# (int) Android NDK version to use
android.ndk = 25b

# (str) Android NDK directory (if empty, it will be automatically downloaded.)
# android.ndk_path =

# (str) Android SDK directory (if empty, it will be automatically downloaded.)
# android.sdk_path =

# (bool) If True, then skip trying to update the Android sdk
android.skip_update = False

# (bool) If True, then automatically accept SDK license
android.accept_sdk_license = True

# (str) Android entry point, default is ok for Kivy-based app
android.entrypoint = org.kivy.android.PythonActivity

[buildozer]

# (int) Log level (0 = error only, 1 = info, 2 = debug (with command output))
log_level = 2

# (int) Display warning if buildozer is run as root (0 = False, 1 = True)
warn_on_root = 1
