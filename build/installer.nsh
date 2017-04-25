!macro customInstall
  ; Add Visual C++ Redistributable for Visual Studio 2015
  File "${BUILD_RESOURCES_DIR}\vc_redist_2015.x86.exe"

  ; Add nRF5x-Command-Line-Tools installer (downloaded by 'npm run get-nrfjprog')
  File "${BUILD_RESOURCES_DIR}\nrfjprog\nrfjprog-win32.exe"

  ; Run installer and wait before continuing
  ExecWait '"$INSTDIR\vc_redist_2015.x86.exe" /passive /norestart'

  ; Run installer and wait before continuing
  ExecWait '"$INSTDIR\nrfjprog-win32.exe" /passive /norestart'
!macroend
