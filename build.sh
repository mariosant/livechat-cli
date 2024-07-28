#! /bin/sh

bun build --compile --target=bun-darwin-x64 ./livechat.ts --outfile build/livechat.darwin-x64
bun build --compile --target=bun-darwin-arm64 ./livechat.ts --outfile build/livechat.darwin-arm64
bun build --compile --target=bun-linux-x64 ./livechat.ts --outfile build/livechat.linux-x64
bun build --compile --target=bun-windows-x64 ./livechat.ts --outfile build/livechat.exe
