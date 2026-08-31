# KTM Copier Pro

https://github.com/aryam441122-lgtm/remix-of-hydra-site-copier.git

ابيك تنسخ كل المجلد KTM اللي بداخل الريبستوري حق جيت هب حقي اللي بحسابي انسخ المجلد كامل وكل محتوياته عندنا هنا بملفات المشروع تنقل مجلد KTM هنا بملفات المشروع ذا وتسوي صفحة بضغطة زر تحمل المجلد كامل وصلح برضو البناء

Microsoft Windows [Version 10.0.26200.9168]
(c) Microsoft Corporation. All rights reserved.

D:\KTM\KTM>yarn build:native && yarn build:python-rpc && npx electron-vite build && npx electron-builder --win nsis
'yarn' is not recognized as an internal or external command,
operable program or batch file.

D:\KTM\KTM>npm i -g yarn

added 1 package in 12s

D:\KTM\KTM>yarn install
yarn install v1.22.22
[1/5] Validating package.json...
[2/5] Resolving packages...
⠈ steam-shortcut-editor@https://github.com/ktmlauncher/steam-shortcut-editorinfo: please complete authentication in your browser...
error Command failed.
Exit code: 128
Command: git
Arguments: ls-remote --tags --heads https://github.com/ktmlauncher/steam-shortcut-editor
Directory: D:\KTM\KTM
Output:
remote: Repository not found.
fatal: repository 'https://github.com/ktmlauncher/steam-shortcut-editor/' not found
info Visit https://yarnpkg.com/en/docs/cli/install for documentation about this command.

D:\KTM\KTM>yarn build:native && yarn build:python-rpc && npx electron-vite build && npx electron-builder --win nsis
yarn run v1.22.22
$ node ./scripts/build-native-addon.cjs
Building ktm-native Rust addon...
Error: spawn cargo ENOENT
    at ChildProcess._handle.onexit (node:internal/child_process:285:19)
    at onErrorNT (node:internal/child_process:483:16)
    at process.processTicksAndRejections (node:internal/process/task_queues:89:21) {
  errno: -4058,
  code: 'ENOENT',
  syscall: 'spawn cargo',
  path: 'cargo',
  spawnargs: [
    'build',
    '--release',
    '--manifest-path',
    'D:\\KTM\\KTM\\native\\ktm-native\\Cargo.toml',
    '--target-dir',
    'D:\\KTM\\KTM\\native\\ktm-native\\target'
  ],
  cmd: 'cargo build --release --manifest-path D:\\KTM\\KTM\\native\\ktm-native\\Cargo.toml --target-dir D:\\KTM\\KTM\\native\\ktm-native\\target',
  stdout: '',
  stderr: ''
}
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.

D:\KTM\KTM>

كيف ابني البرنامج واخذ المثبت nsis

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ktm-cloud.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e6367d4d-fda2-49bf-b5cc-c03ec379ab64).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
