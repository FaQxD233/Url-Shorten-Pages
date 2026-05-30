# API documentation

This project uses Cloudflare Pages Functions. The API endpoint is:

```text
https://your-project.pages.dev/api
```

Request method: `POST`

Request body: JSON

```json
{
  "cmd": "add",
  "url": "https://example.com",
  "key": "ilikeu",
  "password": "your-password"
}
```

Parameters:

- `cmd`: `add`, `del`, `qry`, or `qryall`
- `url`: long URL, required for `add`
- `key`: short key, required for `del` and `qry`, optional for `add`
- `password`: management password

New key rules for `add`:

- 1-64 characters
- Allowed characters: `A-Z`, `a-z`, `0-9`, `_`, `-`
- Reserved keys: `api`, `password`

For compatibility with existing KV data, `qry`, `del`, `qryall`, and redirects can read legacy keys that do not match the new-key rule, except reserved keys.

Example response:

```json
{
  "status": 200,
  "error": "",
  "key": "HcAx62",
  "url": ""
}
```

Data is stored in the KV namespace bound as `LINKS`.
