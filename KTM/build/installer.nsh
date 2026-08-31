!macro customUnInstall
  ${ifNot} ${isUpdated}
    RMDir /r "$LOCALAPPDATA\ktmlauncher-updater"
  ${endIf}
!macroend
