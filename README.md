# I18N - Postgres, NodeJS, Admin, User and Translator pages

### ✔ [ZIP archive on GitHub](../../archive/master.zip)

## `USAGE`
```bash
$ node server.js                   # launch server
$ explorer 1_index.url             # visit index page
$ explorer 2_server_index.url      # visit server-dashboard page
$ explorer 3_user_feedback.url     # visit user-feedback page     f(URI/cookies: LANG,USER_ID)
$ explorer 3_user_feedback_dev.url # visit user-feedback-dev page f(URI/cookies: LANG,USER_ID) SELECT[250])
$ explorer 4_i18n_populate.url     # visit translation provider page
```

### `SERVER - NodeJS and web pages`
File                     | Description
-------------------------|---------------------------
server.js                | server NodeJS
index.html               | server LAN URL
server_index.html        | SERVER-DASHBOARD page URL
CLIENT/index_client.html | CLIENT-FRAME cookies + URI

### `CLIENT - USER feedback`
File                   | Description
-----------------------|------------------------------------
user_feedback.html     | subject and questions layout
user_feedback_dev.html | (same with language selector added)
form.html              | User input-form
feedback_tree.js       | localized user-feedback-page-logic
feedback.css           | user page stylesheet

### `CLIENT - I18N REPORTING and TRANSLATING reported as missing translations`
File                          | Description
------------------------------|-------------------------------
I18N/i18n_populate.html       | translator page
I18N/i18n_populate.css        | translator page stylesheet
I18N/i18n_translate.js        | page translation and reporting
I18N/i18n_populate.js         | missing translations editor

### `POSTGRES - DATABASE config and SQL queries`
File                          | Description
------------------------------|-------------
config_dev.json               | …
POSTGRES/server_sql.js        | …

## `DASHBOARD -  server control web page`

File                          | Description
------------------------------|------------
CONTROL/index_control.html    | …
CONTROL/feedback_postgres.js  | …
CONTROL/server_control.js     | …
CONTROL/server_download.js    | …
CONTROL/t_details.js          | …

1. buttons to CREATE the 3 required DATABASE TABLES

 TABLE       | fields
 ------------|-------
 *topics*    | subject  question
 *i18n*      | lang     key      val     
 *feedbacks* | user_id  subject  question feedback comment

2. buttons to check localized SQL queries f(LANG and USER_ID)

Button                        | Description
------------------------------|-------------------------------------------------
 feedback_topics_json.js      | check current topics table content
 feedback_replies_json.js     | check current user replies ➔ f(USER_ID)
 populate_lang_key_val_json.js| check generated missing translation page builder
 i18n_translate_json.js       | check generated LANG translation dictionary
