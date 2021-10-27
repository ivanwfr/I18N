//┌────────────────────────────────────────────────────────────────────────────┐
//│ [server_sql] .. [SELECT] [DELETE] [INSERT] [GENERATE] _TAG (211027:17h:13) │
//└────────────────────────────────────────────────────────────────────────────┘
/* jshint esversion 9, laxbreak:true, laxcomma:true, boss:true */ /*{{{*/
/* globals  module */
/* globals  console */ /* eslint-disable-line no-unused-vars */
/* eslint-disable no-warning-comments */
/* exported lib_postgres, SERVER_SQL_JS_TAG */

const SERVER_SQL_JS_ID  = "lib_postgres";
const SERVER_SQL_JS_TAG = SERVER_SQL_JS_ID+" (211021:04h:02)";    // eslint-disable-line no-unused-vars
/*}}}*/
let server_sql = (function() {
"use strict";

/*{{{*/
/* eslint-disable no-unused-vars */
const     JS_RESPONSE_HEADER = { "Content-Type" : "text/javascript;" };
const    CSS_RESPONSE_HEADER = { "Content-Type" : "text/css;"        };
const   HTML_RESPONSE_HEADER = { "Content-Type" : "text/html; charset=UTF-8", "Access-Control-Allow-Origin" : "*" };
const IMAGES_RESPONSE_HEADER = {         "type" : "image/x-icon"     };
/* eslint-enable  no-unused-vars */
/*}}}*/
/*_ LOG (ANSII-TERMINAL) {{{*/
/* eslint-disable no-unused-vars */
const TRACE_OPEN  = " {{{";
const TRACE_CLOSE = " }}}";

const   ESC = String.fromCharCode(27);

const R=ESC+"[1;31m"; //     RED
const G=ESC+"[1;32m"; //   GREEN
const Y=ESC+"[1;33m"; //  YELLOW
const B=ESC+"[1;34m"; //    BLUE
const M=ESC+"[1;35m"; // MAGENTA
const C=ESC+"[1;36m"; //    CYAN
const N=ESC+"[0m"   ; //      NC

let log_X = function(args         ) { console.log(      ...args ); };
let log_R = function(arg0, ...rest) { log_X([ R + arg0, ...rest]); };
let log_G = function(arg0, ...rest) { log_X([ G + arg0, ...rest]); };
let log_B = function(arg0, ...rest) { log_X([ B + arg0, ...rest]); };

let log_C = function(arg0, ...rest) { log_X([ C + arg0, ...rest]); };
let log_M = function(arg0, ...rest) { log_X([ M + arg0, ...rest]); };
let log_Y = function(arg0, ...rest) { log_X([ Y + arg0, ...rest]); };

let log_N = function(arg0, ...rest) { log_X([ N + arg0, ...rest]); };

/* eslint-enable  no-unused-vars */
/*}}}*/

//┌────────────────────────────────────────────────────────────────────────────┐
//│ SELECT                                                                     │
//└────────────────────────────────────────────────────────────────────────────┘
let SELECT_feedbacks            = function(config, args) //{{{
{
    if(config.LOG_MORE) console.log("SELECT_feedbacks");

    return `SELECT * FROM feedbacks WHERE user_id='${args.user_id         }' ORDER BY subject,question`;
}; //}}}
let SELECT_i18n                 = function(config, args) /* eslint-disable-line no-unused-vars */ //{{{
{
if(config.LOG_MORE) console.log("SELECT_i18n");

    return `SELECT * FROM i18n                                               ORDER BY key`; /* eslint-disable-line quotes */
}; //}}}
let SELECT_topics               = function(config, args) /* eslint-disable-line no-unused-vars */ //{{{
{
if(config.LOG_MORE) console.log("SELECT_topics");

    return `SELECT * FROM topics                                             ORDER BY subject,question`; /* eslint-disable-line quotes */
}; //}}}


//┌────────────────────────────────────────────────────────────────────────────┐
//│ DELETE // INSERT // APPEND                                                 │
//└────────────────────────────────────────────────────────────────────────────┘
let delete_FROM_FEEDBACK_TABLE  = function(config, args) //{{{
{
if(config.LOG_MORE) console.log("delete_FROM_FEEDBACK_TABLE");

    return `DELETE FROM ${config.FEEDBACK_TABLE}
        WHERE  user_id='${args.user_id         }'
        AND    subject='${args.subject         }'
        AND   question='${args.question        }';`
    ;

}; //}}}
let insert_INTO_FEEDBACK_TABLE  = function(config, args) //{{{
{
if(config.LOG_MORE) console.log("insert_INTO_FEEDBACK_TABLE");

    return `INSERT INTO ${config.FEEDBACK_TABLE}
                values('${args.user_id         }',
                       '${args.subject         }',
                       '${args.question        }',
                       '${args.feedback        }',
                       '${args.comment         }');`
    ;

};//}}}
let delete_FROM_I18N_TABLE      = function(config, args) //{{{
{
if(config.LOG_MORE) console.log("delete_FROM_I18N_TABLE");

    return `DELETE FROM ${config.I18N_TABLE}
             WHERE lang='${args.lang       }'
             AND    key='${args.key        }';`
    ;

}; //}}}
let insert_INTO_I18N_TABLE      = function(config, args) //{{{
{
if(config.LOG_MORE) console.log("insert_INTO_I18N_TABLE");

    return `INSERT INTO ${config.I18N_TABLE}
                values('${args.lang        }',
                       '${args.key         }',
                       '${args.val         }')
                ON CONFLICT DO NOTHING;`
    ;

};//}}}
let append_INTO_I18N_TABLE      = function(config, args) //{{{
{
if(config.LOG_MORE) console.log("append_INTO_I18N_TABLE");

    return `INSERT INTO ${config.I18N_TABLE}
                values('${args.lang        }',
                       '${args.key         }',
                       '${args.val         }')
                ON CONFLICT DO NOTHING;`
    ;

};//}}}


//┌────────────────────────────────────────────────────────────────────────────┐
//│ GENERATE                                                                   │
//└────────────────────────────────────────────────────────────────────────────┘
let get_query_for_file_name     = function(file_name,config,args) /* eslint-disable-line no-unused-vars */ //{{{
{
    let query
        =  (file_name == "feedback_topics_json.js"      ) ? server_sql.SELECT_topics   (config, args)
        :  (file_name == "feedback_replies_json.js"     ) ? server_sql.SELECT_feedbacks(config, args) //.replace(/\?/, ( user_id || "%"))
        :  (file_name == "i18n_translate_json.js"       ) ? server_sql.SELECT_i18n     (config, args)
        :  (file_name == "populate_lang_key_val_json.js") ? server_sql.SELECT_i18n     (config, args)
        :                                                   ""
    ;

if(config.LOG_MORE) console.log("get_query_for_file_name("+file_name+"): return ["+query+"]");
    return query;
};
/*}}}*/

//┌────────────────────────────────────────────────────────────────────────────┐
//│ TABLES                                                                     │
//└────────────────────────────────────────────────────────────────────────────┘
/*_ get_table_names {{{*/

const TABLE_NAMES
    = [   "topics"
        , "i18n"
        , "feedbacks"
    ];

let get_table_names = function()
{
    return TABLE_NAMES;
};
/*}}}*/
/*_ populate_JSON {{{*/
let populate_JSON = function(res,args,response)
{
console.log("populate_JSON("+args.file_name+")");
    let consumed_by = "";

    if(      ( (args.file_name == "feedback_topics_json.js"      ) && res.rows)
          || ( (args.file_name == "feedback_replies_json.js"     ) && res.rows)
          || ( (args.file_name == "i18n_translate_json.js"       ) && res.rows)
          || ( (args.file_name == "populate_lang_key_val_json.js") && res.rows)
      )
    {
        log_M( M+"  ┌────────────────────────────────────────────────────────────────────────────┐\n"
              +M+"… │ SQL QUERY: "+G+args.file_name+" "+Y+args.lang+" "+B+args.user_id+"\n"
              +M+"  └────────────────────────────────────────────────────────────────────────────┘");

        if     (args.file_name == "feedback_topics_json.js"      ) generate_feedback_topics_json(args, response, res);
        else if(args.file_name == "feedback_replies_json.js"     ) generate_feedback_users_json (args, response, res);
        else if(args.file_name == "i18n_translate_json.js"       ) generate_i18n_translate_json (args, response, res);
        else if(args.file_name == "populate_lang_key_val_json.js") generate_populate_i18n_json  (args, response, res);

        consumed_by = "populate_JSON";
    }
    return consumed_by;
};
/*}}}*/
/*{{{*/
//┌───────────────▼▼▼▼▼▼───────────────────────────────────────────────────────┐
//│ 1/4 -  TABLE [topics   ] ➔ [feedback_topics_json]                          │
//└───────────────▲▲▲▲▲▲───────────────────────────────────────────────────────┘
//{{{
//┌────────────────────────────────────────────────────────────────────────────┐
//│ CREATE TABLE  topics (subject varchar, question varchar)                   │
//├────────────────────────────────────────────────────────────────────────────┤
//│ let feedback_topics_json = [                                               │
//│  { subject, questions },                                                   │
//│   ...                                                                      │
//│ })();                                                                      │
//└────────────────────────────────────────────────────────────────────────────┘
//}}}
/*_ generate_feedback_topics_json {{{*/
/* eslint-disable quotes */
let generate_feedback_topics_json = function(args, response, res)
{
console.log("generate_feedback_topics_json(args, response, #res.rows.length=["+res.rows.length+"])");
    response.writeHead(200, JS_RESPONSE_HEADER);
/* GENERATED FILE HEADER {{{*/
    let js_code =
`/*
${args.file_name}:
GENERATED by ${SERVER_SQL_JS_TAG}➔generate_feedback_topics_json
FROM URI=[${JSON.stringify(args)}]

...${new Date()}

*/
/* jshint esversion: 9, laxbreak:true, laxcomma:true, boss:true */
"use strict";
`;

//log_Y(        js_code     )
response.write( js_code+"\n");
    /*}}}*/
    /* OPEN  [subject ARRAY] {{{*/
    let subject, questions;

    js_code = "let feedback_topics_json = [";
//log_B(        js_code     )
response.write( js_code+"\n");

    /*}}}*/
    /* ADD   [questions ARRAY] {{{*/
    for(let i=0;      i < res.rows.length; ++i)
    {
        subject     =     res.rows[i  ].subject .replace(/,,/g,";");
        questions   = '"'+res.rows[i  ].question.replace(/,,/g,";")+ '"';

        while(   ((i+1) < res.rows.length)
              && (        res.rows[i+1].subject == subject))
            questions += '\n              , "'
            +             res.rows[++i].question.replace(/,,/g,";")+'"';

        /* FLUSH subject questions */
        js_code = ` { "subject" : "${subject}"  \n , "questions" : [ ${questions}]\n },`;
//log_B(        js_code     )
response.write( js_code+"\n");
    }

    /*}}}*/
    /* CLOSE [subject ARRAY] {{{*/
        js_code = "];";
//log_B(        js_code     )
response.write( js_code+"\n");
    /*}}}*/
};
/* eslint-enable  quotes */
/*}}}*/
//┌───────────────▼▼▼▼▼▼▼▼▼────────────────────────────────────────────────────┐
//│ 2/4 -  TABLE [feedbacks] ➔ [feedback_replies_json]                         │
//└───────────────▲▲▲▲▲▲▲▲▲────────────────────────────────────────────────────┘
//{{{
//┌────────────────────────────────────────────────────────────────────────────┐
//│ CREATE TABLE feedbacks (                                                   │
//│     user_id  uuid NOT NULL,                                                │
//│     subject  varchar,                                                      │
//│     question varchar,                                                      │
//│     feedback varchar,                                                      │
//│     comment  varchar                                                       │
//│ );                                                                         │
//├────────────────────────────────────────────────────────────────────────────┤
//│ let feedback_replies_json = [                                                │
//│  { subject, question, feedback, comment },                                 │
//│   ...                                                                      │
//│ ];                                                                         │
//└────────────────────────────────────────────────────────────────────────────┘
//}}}
/*_ generate_feedback_users_json {{{*/
let generate_feedback_users_json = function(args, response, res)
{
//if(config.LOG_MORE) log_M("generate_feedback_users_json(args, response, #res.rows.length=["+res.rows.length+"])");

    response.writeHead(200, JS_RESPONSE_HEADER);
/* GENERATED FILE HEADER {{{*/
    let js_code =
`/*
${args.file_name}:
GENERATED by ${SERVER_SQL_JS_TAG}➔generate_feedback_users_json
FROM URI=[${JSON.stringify(args)}]

...${new Date()}

*/
/* jshint esversion: 9, laxbreak:true, laxcomma:true, boss:true */
"use strict";
`;

  log_Y(        js_code     );
response.write( js_code+"\n");
    /*}}}*/
    /* OPEN  [subject] ARRAY {{{*/
    js_code = "let feedback_replies_json = [";
  log_B(        js_code     );
response.write( js_code+"\n");

    /*}}}*/
    /* ADD   {subject, question, feedback, comment} OBJECT {{{*/
    for(let i = 0; i < res.rows.length; ++i)
    {
        let  subject = res.rows[i].subject .replace( /,,/g,";");
        let question = res.rows[i].question.replace( /,,/g,";");
        let feedback = res.rows[i].feedback;
        let  comment = res.rows[i].comment .replace( /,,/g,";")
            /*...........................*/.replace(/\r+/gm,"")
            /*...........................*/.replace(/\n+/gm,"\\n");

        js_code =
`{ "subject" : "${ subject  }"
, "question" : "${ question }"
, "feedback" : "${ feedback }"
,  "comment" : "${ comment  }"
},`
;

// comment : \`${ comment  }\` (210907)

  log_B(        js_code     );
response.write( js_code+"\n");
    }

    /*}}}*/
    /* CLOSE [subject] ARRAY {{{*/
        js_code = "];";
  log_B(        js_code     );
response.write( js_code+"\n");
    /*}}}*/
};
/*}}}*/
//┌───────────────▼▼▼▼─────────────────────────────────────────────────────────┐
//│ 3/4 -  TABLE [i18n     ] ➔ [i18n_translate_json populate_lang_key_val_json]│
//└───────────────▲▲▲▲─────────────────────────────────────────────────────────┘
//{{{
//┌────────────────────────────────────────────────────────────────────────────┐
//│ CREATE TABLE i18n (lang varchar,key varchar,val varchar, UNIQUE(lang,key)) │
//├────────────────────────────────────────────────────────────────────────────┤
//│ let i18n_translate_json   = (function() {                                   │
//│  return {                                                                  │
//│   "FR": {"key": "val", ... },                                              │
//│   "EN": {"key": "val", ... },                                              │
//│    ...                                                                     │
//│  };                                                                        │
//│ })();                                                                      │
//└────────────────────────────────────────────────────────────────────────────┘
//}}}
/*_ generate_i18n_translate_json {{{*/
let generate_i18n_translate_json = function(args, response, res)
{
    generate_named_json("i18n_translate_json", args, response, res);
};
/*}}}*/
/*_ generate_populate_i18n_json {{{*/
let generate_populate_i18n_json = function(args, response, res)
{
    generate_named_json("populate_lang_key_val_json", args, response, res);
};
/*}}}*/
/*_ generate_named_json {{{*/
let generate_named_json = function(named_json, args, response, res)
{
//log_Y(""+args.file_name+": res.rows.length=["+res.rows.length+"]");
    response.writeHead(200, JS_RESPONSE_HEADER);
/* GENERATED FILE HEADER {{{*/
    let js_code =
`/*
${args.file_name}:
GENERATED by ${SERVER_SQL_JS_TAG}➔generate_named_json
FROM URI=[${JSON.stringify(args)}]
...${new Date()}
*/
/* jshint esversion: 9, laxbreak:true, laxcomma:true, boss:true */
/* exported ${named_json} */
`;

//log_Y(        js_code     )
response.write( js_code+"\n");
    /*}}}*/
/* OPEN A SELF CALLING FACTORY FUNCTION {{{*/
    js_code =
`let ${named_json} = (function() {
"use strict";

return {`; /*}*/
//log_Y(        js_code     )
response.write( js_code+"\n");
    /*}}}*/
    /* ADD {lang {{key,val}, ...}} OBJECTS COLLECTION {{{*/
    let res_rows
        = res.rows
        .  sort( function(a,b) { return (a.lang + a.key > b.lang + b.key) ? 1 : -1; }); /* case sensitive */
    for(let i=0;  i < res_rows.length; ++i)
    {
        /* NEXT "lang" .. FIRST {key, val} {{{*/
        let lang    =  res_rows[i].lang;
        if( lang    == "undefined" ) continue;

        js_code     = (i>0 ? ", " : "")
            +         ` "${lang}": { "${res_rows[i].key}" : "${res_rows[i].val}"`; // FIRST lang {key, val}
//log_Y(        js_code     )
response.write( js_code+"\n");

        /*}}}*/
        /* SAME "lang" ... MORE {key, val} {{{*/
       while (   ((i+1) < res_rows.length)
              && (        res_rows[i+1].lang == lang))
        {
            i      += 1;
            js_code = (i>0 ? "       ," : "")
                    + ` "${res_rows[i].key}" : "${res_rows[i].val}"`;
//log_B(        js_code     )
response.write( js_code+"\n");
        }

        /*}}}*/
        js_code = " }";
//log_Y(        js_code     )
response.write( js_code+"\n");
    }
    /*}}}*/
/* CLOSE FACTORY FUNCTION {{{*/
    js_code =
` };
})();
`;
//log_Y(        js_code     )
response.write( js_code+"\n");
/*}}}*/
};
/*}}}*/
/*}}}*/

return { get_table_names

    //   SELECT
    ,    SELECT_topics
    ,    SELECT_i18n
    ,    SELECT_feedbacks

    //   DELETE // INSERT // APPEND
    ,    delete_FROM_FEEDBACK_TABLE
    ,    insert_INTO_FEEDBACK_TABLE
    ,    delete_FROM_I18N_TABLE
    ,    insert_INTO_I18N_TABLE
    ,    append_INTO_I18N_TABLE

    //  GENERATE
    ,   get_query_for_file_name
    ,   populate_JSON
};

})();

try { module.exports = server_sql; } catch(ex) {} /* server.js require */

