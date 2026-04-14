#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

npm install express cors dotenv @prisma/client
npm install -D typescript @types/node @types/express @types/cors ts-node-dev prisma
