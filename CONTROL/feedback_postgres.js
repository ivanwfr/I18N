//┌────────────────────────────────────────────────────────────────────────────┐
//│ [feedback_postgres.js]                                                     │
//└────────────────────────────────────────────────────────────────────────────┘
/* jshint esversion: 9, laxbreak:true, laxcomma:true, boss:true */ /*{{{*/
/* globals  console, require, module */
/* exported feedback_postgres, FEEDBACK_POSTGRES_JS_TAG */

const FEEDBACK_POSTGRES_JS_ID  = "feedback_postgres";
const FEEDBACK_POSTGRES_JS_TAG = FEEDBACK_POSTGRES_JS_ID+" (211014:14h:24)";    // eslint-disable-line no-unused-vars
/*}}}*/

let feedback_postgres = (function() {
"use strict";



//┌────────────────────────────────────────────────────────────────────────────┐
//│ CONFIG .. [HOST USER PASSWORD DATABASE] .. [TABLES] .. [SELECT]            │
//└────────────────────────────────────────────────────────────────────────────┘
/* eslint-disable no-warning-comments */
/*{{{*/

const     JS_RESPONSE_HEADER = { "Content-Type" : "text/javascript;" };
//nst    CSS_RESPONSE_HEADER = { "Content-Type" : "text/css;"        };
const   HTML_RESPONSE_HEADER = { "Content-Type" : "text/html; charset=UTF-8", "Access-Control-Allow-Origin" : "*" };
//nst IMAGES_RESPONSE_HEADER = {         "type" : "image/x-icon"     };

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

/*➔ configure {{{*/
let config    = {};
let configure = function(_config)
{
    config    = _config;
};
/*}}}*/
/*➔ require Client {{{*/
let { Client }  = require("pg");

/*}}}*/
/*➔ new_Client {{{*/
/*{{{*/
let     client;
/*}}}*/
let new_Client = function()
{
    if( !client )
    {
        client = new Client({ host     : config.HOST
                            , user     : config.USER
                            , password : config.PASSWORD
                            , database : config.DATABASE
        });
        client.connect();
    }
};
/*}}}*/

//┌────────────────────────────────────────────────────────────────────────────┐
//│ TABLES                                                                     │
//└────────────────────────────────────────────────────────────────────────────┘
/*➔ dump_USR_TABLES {{{*/
let dump_USR_TABLES_stack;

let dump_USR_TABLES = function(response)
{
    new_Client();

    let tables
        = [   config.   TOPICS_TABLE
            , config.     I18N_TABLE
            , config. FEEDBACK_TABLE
//          , config.    XPATH_TABLE
//          , config. SITE_TREE_TABLE
        ];

    response.as_html = true;

    dump_USR_TABLES_stack = Array.from( tables );

    dump_USR_TABLES_next(response);
};
/*}}}*/
/*_ dump_USR_TABLES_next {{{*/
let dump_USR_TABLES_next = function(response)
{
    let db_name = dump_USR_TABLES_stack.shift(); // Removes the first element from an array and returns that element
//log_M("db_name=["+db_name+"]")

    if( db_name ) {
        let query = "SELECT * FROM "+ db_name;
//log_M( query );

        let args = { query };
        client.query(query, function(err,res) { query_callback(args,response, err,res); });
    }
    else {
        response.write("<em>client.end</em>");
//console.log("response.request_count["+response.request_count+"] dump_USR_TABLES_next"+TRACE_CLOSE)
        response.end();
        //client.end(); // KEEP IT ALIVE
    }
};
/*}}}*/

//┌────────────────────────────────────────────────────────────────────────────┐
//│ SQL QUERY         .. [args] := { [query OR file_name] , [user_id] , [lang] │
//└────────────────────────────────────────────────────────────────────────────┘
/* RESPONSE_STYLESHEET {{{*/
const RESPONSE_STYLESHEET /* eslint-disable-line no-unused-vars */
=`
/* ECC color-code {{{
<style>
.bg1 { background-color:rgba(150,075,000,0.4); } .bg1 * { color: #FFF; }
.error,
.bg2 { background-color:rgba(255,000,000,0.4); } .bg2 * { color: #FFF; }
.bg3 { background-color:rgba(255,165,000,0.4); } .bg3 * { color: #000; }
.bg4 { background-color:rgba(255,255,000,0.4); } .bg4 * { color: #000; }
.response,
.bg5 { background-color:rgba(154,205,050,0.4); } .bg5 * { color: #000; }
.bg6 { background-color:rgba(100,149,237,0.4); } .bg6 * { color: #000; }
.bg7 { background-color:rgba(238,130,238,0.4); } .bg7 * { color: #000; }
.bg8 { background-color:rgba(160,160,160,0.4); } .bg8 * { color: #000; }
.bg9 { background-color:rgba(255,255,255,0.4); } .bg9 * { color: #000; }
.bg0 { background-color:rgba(032,032,032,0.4); } .bg0 * { color: #FFF; }

</style>
}}}*/
`;
/*}}}*/
/*➔ sql_query {{{*/
/*{{{*/
let pending_queries = [];

/*}}}*/
let sql_query = function(response, qtext, uri)
{
let log_this=false;
if( log_this ) console.log("sql_query(response, qtext, uri=["+uri+"])");
//console.log("qtext:\n[\n"+qtext+"\n]")

    new_Client();

    /* queries {{{*/
    let queries = qtext.split(";");

    for(let i=0; i < queries.length; ++i)
    {
        queries[i] = queries[i].trim();

        if(!queries || (queries[i] == "''")) { queries.splice(i, 1); --i; }
    }
if(log_this) log_R("queries: ... length=["+(queries ? queries.length : "")+"]:");
//console.dir( queries )
    /*}}}*/

    for(let i=0; i < queries.length; ++i)
    {
        let query =  queries[i];
        if( query ) {
            pending_queries.push(query);
/* LOG {{{*/
if( log_this ) {
    let sql = query.replace(/\)\s*/g,"\n) ").replace(/\s*,\s*/g,"\n, ");

let count
= ((pending_queries.length > 0   ) ? " ["+(i+1)+" / "+pending_queries.length+"]:" :   "")
//(             sql.includes  ("\n") ? "\n"                                       :   "")
        + "\n"
;

if(config.LOG_MORE)
log_M("  ┌────────────────────────────────────────────────────────────────────────────┐\n"
    + "… │ POSTGRES "+count + sql.replace(/^/gm,"… │  ").replace(/ *\b(values|WHERE|AND|OR)\b/igm,"\n… │  $1")+"\n"
    + "  └────────────────────────────────────────────────────────────────────────────┘");

}
/*}}}*/
            let args = { query , uri };
            client.query(query, function(err,res) { query_callback(args,response, err,res); });
        }
    }
if( log_this) log_C("sql_query: "+(pending_queries ? pending_queries.length : "")+" pending_queries...");
};
/*}}}*/
/*_ query_callback {{{*/
const LF = String.fromCharCode(10); // eslint-disable-line no-unused-vars

let query_callback = function(args,response, err,res) // eslint-disable-line complexity
{
let log_this= false;
if( log_this) log_M(  "┌────────────────┐\n"
                     +"│ query_callback"    );
/*{{{*/
//console.log("...args ("+(typeof args)+"):")
//console.log("...query_callback: args=["+args+"]")
//console.log(args)
/*}}}*/
    /* 1/3 [err] {{{*/
    if( err ) {
if( log_this) log_M(  "│ 1/3 ➔ err"         );

        args.origin = "query_callback";
        query_callback_err(args,response,err);
    }
    /*}}}*/
    /* 2/3 [res.rows] {{{*/
    else if((res.rows && res.rows.length) || args.no_reply_ok) {
if( log_this) log_M( "│ 2/3 ➔ "+res.rows.length+" ROWS"+(args.no_reply_ok ? " no_reply_ok" : ""));
//console.dir(res.rows)

        /* POPULATE JSON {{{*/
        if(      ( (args.file_name == "feedback_topics_json.js"      ) && res.rows)
              || ( (args.file_name == "feedback_replies_json.js"     ) && res.rows)
              || ( (args.file_name == "i18n_translate_json.js"       ) && res.rows)
              || ( (args.file_name == "populate_lang_key_val_json.js") && res.rows)
//            || ( (args.file_name == "jqgram_tree.js"               ) && res.rows)
          )
        {
if(config.LOG_MORE)
            log_M( M+"  ┌────────────────────────────────────────────────────────────────────────────┐\n"
                  +M+"… │ POSTGRES QUERY: "+G+args.file_name+" "+Y+args.lang+" "+B+args.user_id+"\n"
                  +M+"  └────────────────────────────────────────────────────────────────────────────┘");

            if     (args.file_name == "feedback_topics_json.js"      ) generate_feedback_topics_json(args, response, res);
            else if(args.file_name == "feedback_replies_json.js"     ) generate_feedback_users_json (args, response, res);
            else if(args.file_name == "i18n_translate_json.js"       ) generate_i18n_translate_json (args, response, res);
            else if(args.file_name == "populate_lang_key_val_json.js") generate_populate_i18n_json  (args, response, res);
//          else if(args.file_name == "jqgram_tree.js"               ) generate_jqgram_tree         (args, response, res);
        }
        /*}}}*/
        /* OR SQL QUERY (TEST-DASHBOARD) {{{*/
        else if(response.as_html)
        {
            /* response.write res.rows */
//console.log("res.rows")
//console.dir( res.rows )

            let lines = "";
            for(let i=0; i<res.rows.length; ++i)
                lines += query_callback_linify_res_row(res.rows[i])+"\n"
//                    .  replace(  /,"/g,  ',<br> ,"'  ) // eslint-disable-line quotes
//                    .  replace(  /,'/g,  ",<br> ,'"  )
////                  .  replace( /:/g,'\t:\t'  ) // eslint-disable-line quotes
//                    .  replace( /"\s*:\s*"/g,'"\t:\t"'  ) // eslint-disable-line quotes
//                    .  replace( /'\s*:\s*'/g,"'\t:\t'"  ) // eslint-disable-line quotes
////                  .  replace(  /,'/g , "'<br>\t,'" )
                ;
//log_M("lines=["+lines+"]")

            if( response ) {
//response.write(RESPONSE_STYLESHEET);
                response.write(`
<div style='width:max-content; overflow:auto;'>
<div style='color:gray; font-size:100%;'>${args.query || args}</div>
<pre style='font-weight:900' class='response'>${lines}</pre>
<hr>
</div>
`);
            }
        }
        /*}}}*/
        /* LINIFY [res.rows] {{{*/
        else {
log_G("...responding with "+res.rows.length+" res.rows:");

            let lines_JSON = JSON.stringify( res.rows );
log_ellipsis(B,"lines_JSON", lines_JSON, 500);

//response.write(RESPONSE_STYLESHEET);
            response.write( lines_JSON );
        }
        /*}}}*/
    }
    /*}}}*/
    /* 3/3 [no response] {{{*/
    else {
if( log_this) log_M( "│ 3/3 ➔ NO res.rows");
//console.dir(args)
        /*  response.reply {{{*/
        if(!response.reply)
        {
            response.reply = { err: "NO SQL REPLY TO REQUEST", ...args };

            let answer
                = response.as_html
                ? ( "<b>"+JSON.stringify( response.reply )+"</b>")
                : ( "/*" +JSON.stringify( response.reply )+ " */");
if(config.LOG_MORE)
            log_ellipsis(Y, "answer", answer, 500);

//response.write(RESPONSE_STYLESHEET);
            response.write( answer );
        }
        /*}}}*/
    }
    /*}}}*/
    /* ... check this query as answered {{{*/
    if(args.query) {
if( log_this) log_M( "│ ...query_callback_pop_pending_queries");

        query_callback_pop_pending_queries(args);
    }
    /*}}}*/
if( log_this) log_M(  "│ query_next\n"
                     +"└────────────────┘"  );
    query_next( response );
};
/*}}}*/
/*_ log_ellipsis {{{*/
let log_ellipsis = function(color, title, msg, len_max)
{
    log_N(color
          + " ➔ "+title+":\n"
          + msg
          .  substring(0,len_max)
          .  replace( /[\{\}\[\]"]/g, " "  )
          .  replace( /,/gm         , "\n" )
          .  trim()
          .  replace( /^ */gm       , "   " )
          + "\n...")
          ;
};
/*}}}*/
/*_ query_next {{{*/
let query_next = function(response)
{
    /* [dump_USR_TABLES_stack] {{{*/
    if( dump_USR_TABLES_stack && dump_USR_TABLES_stack.length)
    {
//log_R("… LAST/NEXT QUERY")
        dump_USR_TABLES_next(response);

    }
    /*}}}*/
    /* [pending_queries] {{{*/
    else if(!pending_queries || !pending_queries.length)
    {
if(config.LOG_MORE)
    log_C("REQUEST #"+response.request_count+" "+TRACE_CLOSE+" NO MORE pending_queries");

        if(response) response.end();
        //client.end(); // KEEP IT AlIVE
    }
    /*}}}*/
};
/*}}}*/
/*_ query_callback_err {{{*/
let query_callback_err = function(args,response,err)
{
//log_M("CALLBACK.query_callback_err: "+ err.stack)
//console.dir(args)

    let args_str
        = JSON.stringify(args)
        .  replace(/^\{/, ""     )
        .  replace(/\}$/, ""     )
        .  replace(/:/g , " : "  )
        .  replace(/,/g , "\n"   )
        .  replace(/^/gm, "│ ➔ " )
    ;

    let reply
        =         "┌ reply ─────────────┐\n"
        + (err ? ("│ "+err             +"\n") : "")
        +         "│ args:\n"+(args_str+"\n")
        +         "└────────────────────┘\n"
    ;
console.log(reply);

    let origin = (args.origin ? args.origin : "");

    response.writeHead(404, HTML_RESPONSE_HEADER ); /* override previous header (which works fine!) */
    response.write(
`/*
${origin} ERROR
<pre id="js_code">${reply}</pre>
<style>HTML * { background-color: rgb(255,0,0,0.7); }</style>
*/`
                  );
//console.log("response.request_count["+response.request_count+"] query_callback_err"+TRACE_CLOSE)
//    response.end();
};
/*}}}*/
/*_ query_callback_pop_pending_queries {{{*/
let query_callback_pop_pending_queries = function(args)
{
//log_N("➔ pending_queries.length=["+pending_queries.length+"]")
//log_N("args.query=["+args.query+"]")
  for(let i=0; i < pending_queries.length; ++i)
  {
//log_N("pending_queries["+i+"]=["+pending_queries[i]+"]")
      if(pending_queries[i] == args.query)
      {
//log_R("… REMOVING ANSWERED pending_queries["+i+"]")

            pending_queries.splice(i, 1); break; // remove only one at a time
        }
    }
};
/*}}}*/
/*_ query_callback_linify_res_row {{{*/
let query_callback_linify_res_row = function(res_row)
{
    return res_row
        ?  JSON.stringify( res_row )
//      .       replace( /(label)/g , "<em class='bg7'>$1</em>")
//      .       replace( /(false)/g , "<em class='bg2'>$1</em>")
//      .       replace( /(true)/g  , "<em class='bg5'>$1</em>")
//      .       replace(/^\[*/, ""                 )
//      .       replace(/\]*$/, ""                 )
//      .       replace(/},/g , "},</li>"+LF+"<li>")
//      .       replace(/},/g , "},"     +LF       )
        :  ""
    ;
};
/*}}}*/

//┌────────────────────────────────────────────────────────────────────────────┐
//│ GENERATE DYNAMIC FILES                                                     │
//└────────────────────────────────────────────────────────────────────────────┘
/*➔ generate_file {{{*/
let generate_file = function(args, response)
{
    let { file_name, lang, user_id           } = args;
//  let { file_name, lang, user_id, site_url } = args;

    log_M(M+"  ┌────────────────────────────────────────────────────────────────────────────┐\n"
         +M+"… │ POPULATE FILE: "+G+file_name+" "+Y+lang+" "+B+user_id+"\n"
         +M+"  └────────────────────────────────────────────────────────────────────────────┘");
    /* POPULATE SQL QUERY {{{*/
    let query;

        query
            = (file_name == "feedback_topics_json.js"      ) ? config.I18N_SELECT_topics
            : (file_name == "feedback_replies_json.js"     ) ? config.I18N_SELECT_feedbacks.replace(/\?/, ( user_id || "%"))
            : (file_name == "i18n_translate_json.js"       ) ? config.I18N_SELECT_i18n
            : (file_name == "populate_lang_key_val_json.js") ? config.I18N_SELECT_i18n

            :                                                  ""
        ;

    if( query )
    {
    log_B(  "  ┌────────────────────────────────────────────────────────────────────────────┐\n"
           +     query.replace(/^/gm,"… │ ")+"\n"
           +"  └────────────────────────────────────────────────────────────────────────────┘");
        new_Client();
        client.query(query, function(err,res) { query_callback(args,response, err,res); });
    }
    /*}}}*/
    /* CANNOT GENERATE THIS FILE {{{*/
    else {
        response.writeHead(404, HTML_RESPONSE_HEADER );
//      response.write(RESPONSE_STYLESHEET);
        response.write(     "/*"
                       +    "<div>"
                       +    " <pre class='error'>"
                       +    "  <b> CANNOT GENERATE THIS FILE .. REQUEST: "+JSON.stringify(args)+"</b>"
                       +    " </pre>"
                       +    "</div>"
                       +    "*/"
                      );
//console.log("response.request_count["+response.request_count+"] generate_file"+TRACE_CLOSE)
        response.end();
    }
    /*}}}*/
};
/*}}}*/

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
//console.log("generate_feedback_topics_json(args, response, #res.rows.length=["+res.rows.length+"])")
    response.writeHead(200, JS_RESPONSE_HEADER);
/* GENERATED FILE HEADER {{{*/
    let js_code =
`/*
${args.file_name}:
GENERATED by ${FEEDBACK_POSTGRES_JS_TAG}➔generate_feedback_topics_json
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
if(config.LOG_MORE)
    log_M("generate_feedback_users_json(args, response, #res.rows.length=["+res.rows.length+"])");

    response.writeHead(200, JS_RESPONSE_HEADER);
/* GENERATED FILE HEADER {{{*/
    let js_code =
`/*
${args.file_name}:
GENERATED by ${FEEDBACK_POSTGRES_JS_TAG}➔generate_feedback_users_json
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
GENERATED by ${FEEDBACK_POSTGRES_JS_TAG}➔generate_named_json
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

//┌───────────────▼▼▼▼▼▼▼▼▼────────────────────────────────────────────────────┐
//│ 4/4 -  TABLE [site_TREE] ➔ [jqgram_tree_js] @see ../TED/jqgram_tree.js     │
//└───────────────▲▲▲▲▲▲▲▲▲────────────────────────────────────────────────────┘
////{{{
////┌────────────────────────────────────────────────────────────────────────────┐
////│ CREATE TABLE site_TREE (                                                   │
////│     site_URL  varchar,                                                     │
////│     site_TREE varchar                                                      │
////│ );                                                                         │
////├────────────────────────────────────────────────────────────────────────────┤
////│ let jqgram_tree_js = [                                                │
////│  { subject, question, feedback, comment },                                 │
////│   ...                                                                      │
////│ ];                                                                         │
////└────────────────────────────────────────────────────────────────────────────┘
////}}}
///*_ generate_jqgram_tree {{{*/
//let generate_jqgram_tree = function(args, response, res)
//{
////console.log("generate_jqgram_tree:")
////console.log(args)
////console.dir(args)
////console.log("res.rows.length=["+res.rows.length+"]")
////console.log("res.rows[0]")
////console.dir( res.rows[0] )
//
//    response.writeHead(200, JS_RESPONSE_HEADER);
//
///* GENERATED FILE HEADER {{{*/
//    let js_code =
//`/*
//${args.file_name}:
//GENERATED by ${FEEDBACK_POSTGRES_JS_TAG}➔generate_jqgram_tree
//FROM URI=[${JSON.stringify(args)}]
//
//...${new Date()}
//*/
///* jshint esversion: 9, laxbreak:true, laxcomma:true, boss:true */
//"use strict";
//`;
//
////log_Y(        js_code     )
//response.write( js_code+"\n");
///*}}}*/
//
///* OPEN A SELF CALLING FACTORY FUNCTION {{{*/
//    js_code =
//`
//let jqgram_tree = (function() {
//    let trees = [];
//
//`; /*}*/
////log_Y(        js_code     )
//response.write( js_code+"\n");
///*}}}*/
//
//    /* POPULATE LITERAL TREE {{{*/
//    js_code =
//`
//    trees.push( /*{{{*/
//          { "label": "a"
//          ,  "tree": [ { "label": "b"
//                       ,  "tree": [ { "label": "c"     }
//                                  , { "label": "d"     }
//                                  ]
//                       }
//                     , { "label": "e"         }
//                     , { "label": "f"         }
//                     ]
//    });
//    /*}}}*/
//    trees.push( /*{{{*/
//          { "label": "a"
//          ,  "tree": [ { "label": "b"
//                       ,  "tree": [ { "label": "c"     }
//                                  , { "label": "d"     }
//                                  ]
//                       }
//                     , { "label": "e"         }
//                     , { "label": "RENAMED_1" }
//                     ]
//    });
//    /*}}}*/
//    trees.push( /*{{{*/
//          { "label": "a"
//          ,  "tree": [ { "label": "b"
//                       ,  "tree": [ { "label": "c"     }
//                                  , { "label": "d"     }
//                                  , { "label": "ADDED" }
//                                  ]
//                       }
//                     , { "label": "e"         }
//                     , { "label": "RENAMED_2" }
//                     ]
//    });
//    /*}}}*/
//`;
////log_Y(        js_code     )
//response.write( js_code+"\n");
//    /*}}}*/
//    /* POPULATE DYNAMIC TREE {{{*/
//    for(let i=0; i < res.rows.length; ++i)
//    {
//    js_code =
//`
//    trees.push( { "label": "${res.rows[i].site_url }"
//            ,      "tree":  ${res.rows[i].site_tree}
//    });
//`;
//
////log_G(          js_code     )
//response.write( js_code+"\n");
//    }
//    /*}}}*/
//
///* CLOSE FACTORY FUNCTION {{{*/
//    js_code =
//`
//    return { trees };
//})();
//console.log("%c LOADING GENERATED jqgram.js", "color:#FAA; font-weight:bolder;");
//`;
////log_Y(        js_code     )
//response.write( js_code+"\n");
///*}}}*/
//
//};
///*}}}*/

    return { configure          // server.js
        ,    dump_USR_TABLES    // server.js
        ,    generate_file      // server.js
        ,    sql_query          // server.js
        ,    query_callback_err // server.js
    };

})();

try { module.exports = feedback_postgres; } catch(ex) {} /* server.js require */

