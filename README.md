# Loja da SKA Logística

## Como iniciar?

```bash
git clone https://github.com/SkaLogistica/loja.git
cd loja
npm install
docker-compose up -d
npx prisma db push
npm run dev
```

### Problemas Comuns

- Caso a lista de gitmojis esteja desatualizada, tente usar `scripts/fetch-gitmojis`: script node para buscar a lista de gitmojis de gitmoji.dev no github.

### Variáveis de Ambiente

- `GOOGLE_CLIENT_{ID,SECRET}`: Informações do cliente OAuth 2.0, recuperadas através do site <https://console.developers.google.com/apis/credentials>.
- `NEXTAUTH_SECRET`: Sugerido utilizar [@sandrinodimattia/generate-secret](https://github.com/sandrinodimattia/generate-secret) para gerar um valor aleatório. Leia mais na documentação do [NextAuth](https://next-auth.js.org/configuration/options#secret)

## Licença

Esse projeto foi licenciado pela Apache License 2.0 - ver [LICENSE](LICENSE) para mais detalhes

## Ambiente de Produção

- ProtonMail e-mail host
- MySql DB PlanetScale
- AWS S3 Bucket
- Vercel Team Deploy
- Google App on <contato@tmtecnologia.dev.br>
