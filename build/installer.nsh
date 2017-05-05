!macro customInstall

  ; Adding Visual C++ Redistributable for Visual Studio 2015
  File "${BUILD_RESOURCES_DIR}\vc_redist_2015.x86.exe"

  ; Running installer and waiting before continuing
  ExecWait '"$INSTDIR\vc_redist_2015.x86.exe" /passive /norestart'

  ; Checking if we have nrfjprog installed, ref:
  ; https://nsis-dev.github.io/NSIS-Forums/html/t-288318.html
  ClearErrors
  EnumRegKey $0 HKLM "SOFTWARE\Nordic Semiconductor\nrfjprog" 0
  IfErrors 0 keyexist
    ; Adding nRF5x-Command-Line-Tools installer (downloaded by 'npm run get-nrfjprog')
    File "${BUILD_RESOURCES_DIR}\nrfjprog\nrfjprog-win32.exe"

    ; Running installer and waiting before continuing
    ExecWait '"$INSTDIR\nrfjprog-win32.exe" /passive /norestart'
  keyexist:

!macroend