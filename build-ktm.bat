@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
title KTM - Auto Build (NSIS)

REM ============================================================
REM  build-ktm.bat  -  ضع هذا الملف بجانب مجلد KTM (خارجه)
REM  يقوم بكل شيء: فحص الأدوات، تثبيتها، إصلاح الحزم المعطوبة،
REM  تثبيت المكتبات، ثم البناء وإخراج مثبت NSIS.
REM ============================================================

set "ROOT=%~dp0"
set "APP=%ROOT%KTM"
if not exist "%APP%\package.json" (
  echo [X] لم أجد مجلد KTM بجانب هذا الملف: "%APP%"
  goto :fail
)
cd /d "%APP%"

echo.
echo ============================================
echo   KTM Auto Build  -  المجلد: %APP%
echo ============================================
echo.

REM ---------- 1) Node.js ----------
call :step "فحص Node.js"
where node >nul 2>&1
if errorlevel 1 (
  echo [!] Node.js غير مثبت - جاري التثبيت عبر winget...
  winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
  call :refreshpath
)
where node >nul 2>&1 || ( echo [X] ثبّت Node.js يدويا من https://nodejs.org ثم أعد التشغيل & goto :fail )
for /f "delims=" %%v in ('node -v') do echo [OK] Node %%v

REM ---------- 2) Yarn ----------
call :step "فحص Yarn"
where yarn >nul 2>&1
if errorlevel 1 (
  echo [!] Yarn غير موجود - جاري تثبيته...
  call npm i -g yarn
  call :refreshpath
)
where yarn >nul 2>&1 && (for /f "delims=" %%v in ('yarn -v') do echo [OK] Yarn %%v) || echo [!] سنكمل باستخدام npm بدل yarn

REM ---------- 3) Rust / cargo ----------
call :step "فحص Rust (cargo) - مطلوب لبناء الإضافة الأصلية"
call :ensurecargo
where cargo >nul 2>&1 || ( echo [X] فشل تثبيت Rust. ثبّته من https://rustup.rs ثم أعد تشغيل الملف & goto :fail )
for /f "delims=" %%v in ('cargo --version') do echo [OK] %%v

REM ---------- 4) Python ----------
call :step "فحص Python"
set "PY="
where python >nul 2>&1 && set "PY=python"
if not defined PY where python3 >nul 2>&1 && set "PY=python3"
if not defined PY (
  echo [!] Python غير مثبت - جاري التثبيت...
  winget install -e --id Python.Python.3.12 --accept-package-agreements --accept-source-agreements
  call :refreshpath
  where python >nul 2>&1 && set "PY=python"
)
if defined PY (for /f "delims=" %%v in ('%PY% --version') do echo [OK] %%v) else (echo [!] بدون Python سيتم تخطي بناء python-rpc)

REM ---------- 5) إصلاح الحزم المعطوبة في package.json ----------
call :step "إصلاح التبعيات المعطوبة (ريبو محذوف / رابط git لا يعمل)"
if not exist "package.json.bak" copy /y "package.json" "package.json.bak" >nul
node "%ROOT%fix-deps.cjs"
if errorlevel 1 ( echo [X] فشل إصلاح package.json & goto :fail )

REM ---------- 6) تثبيت المكتبات ----------
call :step "تثبيت المكتبات (قد يستغرق عدة دقائق)"
set "INSTALL_OK="
where yarn >nul 2>&1 && (
  call yarn install --ignore-engines --network-timeout 600000 && set "INSTALL_OK=1"
)
if not defined INSTALL_OK (
  echo [!] فشل yarn - نجرب yarn بدون سكربتات ما بعد التثبيت...
  where yarn >nul 2>&1 && ( call yarn install --ignore-engines --ignore-scripts --network-timeout 600000 && set "INSTALL_OK=1" )
)
if not defined INSTALL_OK (
  echo [!] نجرب npm...
  call npm install --legacy-peer-deps --ignore-scripts && set "INSTALL_OK=1"
)
if not defined INSTALL_OK ( echo [X] فشل تثبيت المكتبات - راجع الرسائل أعلاه & goto :fail )
echo [OK] تم تثبيت المكتبات

REM ---------- 7) بناء الإضافة الأصلية ----------
call :step "بناء ktm-native (Rust)"
call node ./scripts/build-native-addon.cjs
if errorlevel 1 (
  echo [!] فشل البناء - نحدّث Rust ونعيد المحاولة...
  rustup update stable
  call node ./scripts/build-native-addon.cjs || ( echo [X] فشل بناء الإضافة الأصلية & goto :fail )
)
echo [OK] الإضافة الأصلية جاهزة

REM ---------- 8) python rpc ----------
call :step "بناء خدمة Python RPC"
if defined PY (
  %PY% python_rpc/setup.py build || echo [!] فشل بناء python-rpc - نكمل بدونه
) else (
  echo [!] تم التخطي - لا يوجد Python
)

REM ---------- 9) بناء التطبيق ----------
call :step "بناء التطبيق (electron-vite)"
call npx --yes electron-vite build
if errorlevel 1 ( echo [X] فشل بناء التطبيق & goto :fail )
echo [OK] تم البناء

REM ---------- 10) مثبت NSIS ----------
call :step "إنشاء مثبت NSIS"
call npx --yes electron-builder --win nsis
if errorlevel 1 (
  echo [!] فشل - نعيد المحاولة مع تعطيل التوقيع وإعادة بناء التبعيات الأصلية...
  set "CSC_IDENTITY_AUTO_DISCOVERY=false"
  call npx --yes electron-builder install-app-deps
  call npx --yes electron-builder --win nsis || ( echo [X] فشل إنشاء المثبت & goto :fail )
)

echo.
echo ============================================
echo   تم بنجاح - المثبت داخل: %APP%\dist
echo ============================================
if exist "%APP%\dist" start "" explorer "%APP%\dist"
goto :end

REM ================= الدوال =================
:step
echo.
echo --- %~1 ---
exit /b 0

:refreshpath
for /f "skip=2 tokens=2,*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path 2^>nul') do set "SYSPATH=%%b"
for /f "skip=2 tokens=2,*" %%a in ('reg query "HKCU\Environment" /v Path 2^>nul') do set "USRPATH=%%b"
set "PATH=%SYSPATH%;%USRPATH%;%USERPROFILE%\.cargo\bin;%APPDATA%\npm"
exit /b 0

:ensurecargo
where cargo >nul 2>&1 && exit /b 0
if exist "%USERPROFILE%\.cargo\bin\cargo.exe" ( set "PATH=%PATH%;%USERPROFILE%\.cargo\bin" & exit /b 0 )
echo [!] cargo غير موجود - جاري تثبيت Rust...
winget install -e --id Rustlang.Rustup --accept-package-agreements --accept-source-agreements
call :refreshpath
where cargo >nul 2>&1 && exit /b 0
echo [!] نجرب rustup-init مباشرة...
curl -sSfLo "%TEMP%\rustup-init.exe" https://win.rustup.rs/x86_64
"%TEMP%\rustup-init.exe" -y --default-toolchain stable --profile minimal
call :refreshpath
exit /b 0

:fail
echo.
echo [X] توقفت العملية. صحح المشكلة أعلاه ثم شغّل الملف مرة أخرى.
pause
exit /b 1

:end
pause
exit /b 0
