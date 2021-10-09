# I18N stack - Postgres, NodeJS, Admin and User page
- Postgres
- NodeJS
- config.json
- server.js
- server-dashboard
- client-page

### ✔ [ZIP archive on GitHub](../../archive/master.zip)

## SERVER
```bash
# console launch server:
$ node server.js
```
### `SERVER`
- server NodeJS and Dashboard-page
|--------------------------|----------------------------|
| server.js                | server NodeJS              |
| index.html               | server LAN URL             |
| server_index.html        | SERVER-DASHBOARD page URL  |
| CLIENT/index_client.html | CLIENT-FRAME cookies + URI |

### `CLIENT`
- client user-feedback-page and translation logic
|------------------------|-------------------------------------|
| feedback_tree.js       | Localized user-feedback-page-logic  |
| feedback.css           | ..................................  |
| form.html              | subject-question-comment input-form |
| user_feedback.html     | ...                                 |
| user_feedback_dev.html | ...                                 |

### `CONTROL`
- client-side dashboard-page
|-------------------------------|-----|
| CONTROL/feedback_postgres.js  | ... |
| CONTROL/index_control.html    | ... |
| CONTROL/server_control.js     | ... |
| CONTROL/server_download.js    | ... |
| CONTROL/t_details.js          | ... |

### `I18N`
- client-side .. translation-helper-and-missing-reporting
- client-side .. dictionary-missing-populate-page
|-------------------------------|--------------------------------|
| I18N/i18n_translate.js        | page translation and reporting |
| I18N/i18n_populate.js         | missing translations editor    |
| I18N/i18n_populate.html       | ...                            |
| I18N/i18n_populate.css        | ...                            |

### `POSTGRES`
- server-side DB config and SQL
|-------------------------------|-----|
| config_dev.json               | ... |
| POSTGRES/server_sql.js        | ... |

