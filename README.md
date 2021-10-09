# I18N stack - Postgres, NodeJS, Admin and User page

### ✔ [ZIP archive on GitHub](../../archive/master.zip)

```bash
# launch server:
$ node server.js

# visit user page:
$ chrome http://localhost:82/index.html
```
### `SERVER - NodeJS and Dashboard-page`

 File                     | Description
 -------------------------|---------------------------
 server.js                | server NodeJS
 index.html               | server LAN URL
 server_index.html        | SERVER-DASHBOARD page URL
 CLIENT/index_client.html | CLIENT-FRAME cookies + URI

### `CLIENT - feedback-page and translation logic`

 File                   | Description
 -----------------------|------------------------------------
 feedback_tree.js       | Localized user-feedback-page-logic
 feedback.css           | …
 form.html              | subject-question-comment input-form
 user_feedback.html     | …
 user_feedback_dev.html | …

### `CONTROL - client-side dashboard-page`

 File                          | Description
 ------------------------------|------------
 CONTROL/feedback_postgres.js  | …
 CONTROL/index_control.html    | …
 CONTROL/server_control.js     | …
 CONTROL/server_download.js    | …
 CONTROL/t_details.js          | …

### `I18N - missing reporting and translation providing page`

 File                          | Description
 ------------------------------|-------------------------------
 I18N/i18n_translate.js        | page translation and reporting
 I18N/i18n_populate.js         | missing translations editor
 I18N/i18n_populate.html       | …
 I18N/i18n_populate.css        | …

### `POSTGRES - server-side DB config and SQL`
 File                          | Description
 ------------------------------|-------------
 config_dev.json               | …
 POSTGRES/server_sql.js        | …
