FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000 
# ou a porta que o serviço usa internamente (se for um microserviço RPC, pode não expor nenhuma)

CMD ["npm", "run", "start"]
# Ou, se for um microserviço puro, talvez seja "npm run start:prod" ou apenas "node dist/main"
# Verifique o script de start no package.json
# Se for um microserviço (não HTTP), o CMD pode ser diferente
# Exemplo para microserviço:
# CMD ["node", "dist/main"]