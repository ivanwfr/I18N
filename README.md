# I18N - PostgreSQL, NodeJS, Admin, User and Translator pages

### ✔ [ZIP archive on GitHub](../../archive/master.zip)

<hr>

## `USAGE`
<!--{{{-->
```bash
$ node server.js                   # launch server
$ explorer 1_index.url             # visit index page
$ explorer 2_server_index.url      # visit server-dashboard page
$ explorer 3_user_feedback.url     # visit user-feedback page     f(URI/cookies: LANG,USER_ID)
$ explorer 3_user_feedback_dev.url # visit user-feedback-dev page f(URI/cookies: LANG,USER_ID) SELECT[250])
$ explorer 4_i18n_populate.url     # visit translation provider page
```

<!--}}}-->

### `SERVER - NodeJS and web pages`
<!--{{{-->

> File                          | Description
> ------------------------------|---------------------------
> server.js                     | server NodeJS
> index.html                    | server LAN URL
> server_index.html             | SERVER-DASHBOARD page URL
> CLIENT/index_client.html      | CLIENT-FRAME cookies + URI

<!--}}}-->

### `CLIENT - USER feedback`
<!--{{{-->

> File                          | Description
> ------------------------------|------------------------------------
> user_feedback.html            | subject and questions layout
> user_feedback_dev.html        | (same with language selector added)
> form.html                     | User input-form
> feedback_tree.js              | localized user-feedback-page-logic
> feedback.css                  | user page stylesheet

<!--}}}-->

### `CLIENT - I18N REPORTING and TRANSLATING reported as missing translations`
<!--{{{-->

> File                          | Description
> ------------------------------|-------------------------------
> I18N/i18n_populate.html       | translator page
> I18N/i18n_populate.css        | translator page stylesheet
> I18N/i18n_translate.js        | page translation and reporting
> I18N/i18n_populate.js         | missing translations editor

<!--}}}-->

### `POSTGRES - DATABASE config and SQL queries`
<!--{{{-->

> File                          | Description
> ------------------------------|-------------
> config_dev.json               | PostgreSQL: db,tables,sql<br>Server: host,port,cert
> POSTGRES/server_sql.js        | Tables: delete,insert,append

<!--}}}-->

## `DASHBOARD -  server control web page`
<!--{{{-->

> File                        | Description
> ----------------------------|-------------
> CONTROL /index_control.html | JS + HTML<br>- server_control.js and CONTROL FORM:<br>TABLES: [topis, feedbacks, i18n]<br>- drop, create, insert<br>- use-case contents template<br>QUERY IFRAME:<br>- generated dynamic js<br>QUERY FORMAT CHECK:<br>- trace log
> CONTROL /server_control.js  | HTTP cookie, submit, user_id, lang      
>      lib/lib_postgres.js    | PostgreSQL database interface
>      lib/t_details.js       | Persistent DETAILS-SUMMARY open state   

<!--}}}-->

  Buttons to CREATE the 3 required DATABASE TABLES
<!--{{{-->

> TABLE       | fields
> ------------|-------
> *topics*    | subject  question
> *i18n*      | lang     key      val
> *feedbacks* | user_id  subject  question feedback comment

<!--}}}-->

  Buttons to check localized SQL queries f(LANG and USER_ID)
<!--{{{-->

> Button                        | Description
> ------------------------------|-------------------------------------------------
> feedback_topics_json.js       | check current topics table content
> feedback_replies_json.js      | check current user replies ➔ f(USER_ID)
> populate_lang_key_val_json.js | check generated missing translation page builder
> i18n_translate_json.js        | check generated LANG translation dictionary

<!--}}}-->

<hr>

### `SCREENSHOTS`

<hr>

`NodeJS server.js` <!--{{{-->
> * _console trace: on startup, after config.json evaluation_
> * _editing **config.json** ➔ kill and restart **node server.js**_

> ![nodejs_server](/screenshot/nodejs_server.png)

<!--}}}-->
`SERVER WEB PAGE (client frame)` <!--{{{-->
> * _href to **user feedback page** with **lang** and **user_id** parameters_
> * _href to the **translation page**_
>    * _lang and user_id will be saved as a site cookie

> ![server_index_client](/screenshot/server_index_client.png)

<!--}}}-->
`SERVER WEB PAGE (control frame)` <!--{{{-->
* PostgreSQL TABLE templates
* _Create, Populate and Delete database tables from scratch_
* _check dynamically generated translation JSON code_
* _JSON error helper_

    ![JSON_parse](/screenshot/JSON_parse.png)

> ![server_index_control](/screenshot/server_index_control.png)

<!--}}}-->
`USER FEEDBACK WEB PAGE` <!--{{{-->
* _translated HTML Elements textContent .. (only those with **class="i18n"** )_

> ![user_feedback](/screenshot/user_feedback.png)

<!--}}}-->
`USER FEEDBACK INPUT FORM` <!--{{{-->
* _(**class="i18n"**) works there as well_

> ![user_feedback_form](/screenshot/user_feedback_form.png)

<!--}}}-->
`TRANSLATOR EDIT WEB PAGE` <!--{{{-->
* _(**class="i18n"**) works there too_

> ![i18n_populate](/screenshot/i18n_populate.png)
<!--}}}-->

<hr>
